import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";

const input = './js/index.js';
const external = ['canvasom', 'physom', '3h-pool'];

export default [
    {
        input,
        external,
        plugins: [
            babel({
                babelHelpers: 'bundled',
                presets: [
                    ['@babel/preset-env', {
                        loose: true,
                    }],
                ],
            }),
            nodeResolve(),
        ],
        output: {
            format: 'umd',
            name: 'PP',
            file: './dist/physom-particles.umd.js',
            globals: {
                canvasom: 'COM',
                physom: 'POM',
                '3h-pool': 'HP',
            },
        },
    },
    {
        input,
        external: external.concat('3h-utils'),
        output: {
            format: 'esm',
            file: './dist/physom-particles.js',
        },
    },
];
