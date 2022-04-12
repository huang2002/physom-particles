# physom-particles

> A simple particle lib for `physom`.

## Example

```javascript
// import PP from 'physom-particles';
// const PP = require('physom-particles');

const particleManager = new PP.ParticleManager();

rootNode.on('click', (event) => {

    const particleGroup = particleManager.createParticleGroup();

    particleGroup.offset.set(
        event.data.x,
        event.data.y,
    );

    rootNode.appendChild(particleGroup);

});
```

## Links

- [API Reference](https://github.com/huang2002/physom-particles/wiki)
- [Changelog](./CHANGELOG.md)
- [License (MIT)](./LICENSE)
