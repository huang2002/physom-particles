/// <reference types=".." />
// @ts-check

/**
 * @param {string} text
 * @param {COM.EventListener<COM.CanvasPointerEvent>} callback
 */
const Button = (text, callback) => (
    COM.create(COM.RectNode, {
        interactive: true,
        width: 100,
        height: 50,
        radius: 5,
        style: {
            fillStyle: 'rgba(255, 255, 255, 0.6)',
            strokeStyle: '#000',
        },
        listeners: {
            click: callback,
        },
    }, [
        COM.create(COM.TextNode, {
            stretch: 1,
            content: text,
            style: {
                fillStyle: '#000',
                font: '20px sans-serif',
                textAlign: 'center',
                textBaseline: 'middle',
            },
        })
    ])
);

const canvasRoot = new COM.CanvasRoot({
    interactive: true,
    renderer: new COM.Renderer({
        width: window.innerWidth,
        height: window.innerHeight,
        autoInitialize: false,
    }),
});

document.body.appendChild(canvasRoot.renderer.canvas);
canvasRoot.renderer.initialize();

const worldNode = new POM.WorldNode({
    stretch: 1,
    root: canvasRoot,
});
canvasRoot.appendChild(/** @type {COM.CanvasNode<any>} */(worldNode));
worldNode.activate();

const particleManager = new PP.ParticleManager();
canvasRoot.on('click', (event) => {
    if (event.data.target !== canvasRoot) {
        return;
    }
    const particleGroup = particleManager.createParticleGroup();
    particleGroup.offset.set(
        event.data.x,
        event.data.y,
    );
    worldNode.appendChild(particleGroup);
});

canvasRoot.appendChild(
    COM.create(COM.FlowNode, {
        offsetX: 20,
        offsetY: 20,
        gap: 10,
    }, [
        Button('clear', () => {
            particleManager.clearParticleGroups();
        }),
    ])
);

canvasRoot.updateAndRender();
