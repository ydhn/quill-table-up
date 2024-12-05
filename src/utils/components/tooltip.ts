import {
  autoUpdate,
  computePosition,
  flip,
  limitShift,
  offset,
  shift,
} from '@floating-ui/dom';
import { handleIfTransitionend } from '../utils';

interface ToolTipOptions {
  direction?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end';
  msg?: string;
  delay?: number;
  content?: HTMLElement;
}
const DISTANCE = 4;
let tooltipContainer: HTMLElement;
export interface TooltipInstance {
  destroy: () => void;
};
export const createTooltip = (target: HTMLElement, options: ToolTipOptions = {}): TooltipInstance | null => {
  const { msg = '', delay = 150, content, direction = 'bottom' } = options;
  if (msg || content) {
    if (!tooltipContainer) {
      tooltipContainer = document.createElement('div');
      document.body.appendChild(tooltipContainer);
    }
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip', 'hidden', 'transparent');
    if (content) {
      tooltip.appendChild(content);
    }
    else if (msg) {
      tooltip.textContent = msg;
    }
    let timer: ReturnType<typeof setTimeout> | null;
    let cleanup: () => void;
    const update = () => {
      if (cleanup) cleanup();
      computePosition(target, tooltip, {
        placement: direction,
        middleware: [flip(), shift({ limiter: limitShift() }), offset(DISTANCE)],
      }).then(({ x, y }) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    };
    const transitionendHandler = () => {
      tooltip.classList.add('hidden');
      if (tooltipContainer.contains(tooltip)) {
        tooltipContainer.removeChild(tooltip);
      }
      if (cleanup) cleanup();
    };
    const open = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        tooltipContainer.appendChild(tooltip);
        tooltip.removeEventListener('transitionend', transitionendHandler);
        tooltip.classList.remove('hidden');

        cleanup = autoUpdate(target, tooltip, update);

        tooltip.classList.remove('transparent');
      }, delay);
    };
    const close = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        tooltip.classList.add('transparent');
        handleIfTransitionend(tooltip, 150, transitionendHandler, { once: true });
      }, delay);
    };

    const eventListeners = [target, tooltip];

    for (const listener of eventListeners) {
      listener.addEventListener('mouseenter', open);
      listener.addEventListener('mouseleave', close);
    }

    const destroy = () => {
      for (const listener of eventListeners) {
        listener.removeEventListener('mouseenter', open);
        listener.removeEventListener('mouseleave', close);
      }
      if (cleanup) cleanup();
      tooltip.remove();
    };
    return {
      destroy,
    };
  }
  return null;
};
