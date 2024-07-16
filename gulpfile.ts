import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dest, parallel, series, src, task, watch } from 'gulp';
import postcss from 'gulp-postcss';
import less from 'gulp-less';
import cleanCSS from 'gulp-clean-css';
import pxtorem from 'postcss-pxtorem';
import autoprefixer from 'autoprefixer';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distBundle = resolve(__dirname, './dist');
const demoBundle = resolve(__dirname, './docs');

const buildDts = async () => {
  const bundle = await rollup(
    {
      input: './src/index.ts',
      external: [/^quill/],
      treeshake: true,
      plugins: [dts()],
    },
  );
  return bundle.write({
    file: resolve(distBundle, 'index.d.ts'),
    sourcemap: false,
    format: 'es',
  });
};
const buildTs = async (isDev: boolean = false) => {
  const bundle = await rollup(
    {
      input: './src/index.ts',
      external: [/^quill/],
      treeshake: true,
      plugins: [typescript({ tsconfig: './tsconfig.json' })],
    },
  );

  return bundle.write(
    isDev
      ? {
          file: resolve(demoBundle, 'dev.js'),
          sourcemap: false,
          format: 'umd',
          name: 'TableUp',
          globals: {
            quill: 'Quill',
          },
          exports: 'named',
        }
      : {
          file: resolve(distBundle, 'index.js'),
          sourcemap: false,
          format: 'es',
        },
  );
};
const buildTheme = (isDev: boolean = false) => {
  return src(['./src/style/index.less', './src/style/table-creator.less'])
    .pipe(less())
    .pipe(
      postcss([
        autoprefixer(),
        pxtorem({
          rootValue: 16,
          propList: ['*'],
          selectorBlackList: ['.ql-'],
        }),
      ]),
    )
    .pipe(
      cleanCSS({}, (details) => {
        console.log(
          `${details.name}: ${details.stats.originalSize / 1000} KB -> ${
              details.stats.minifiedSize / 1000
          } KB`,
        );
      }),
    )
    .pipe(dest(isDev ? demoBundle : distBundle));
};

const buildModule = parallel(buildTs.bind(undefined, false), buildDts);
const dev = () => {
  watch('./src/**/*.ts', buildTs.bind(undefined, true));
  watch('./src/**/*.less', buildTheme.bind(undefined, true));
};

task('default', parallel(buildModule, buildTheme.bind(undefined, false)));
task('dev', series(dev));
