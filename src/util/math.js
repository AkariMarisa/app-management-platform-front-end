import { create, all } from 'mathjs';

const math = create(all, {
    epsilon: 1e-12,
    matrix: 'Matrix',
    number: 'number',
    precision: 64,
    predictable: false,
    randomSeed: null
})

export default math