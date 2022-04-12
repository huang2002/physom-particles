import { BodyNode, WorldNode, WorldNodeEvents, WorldNodeOptions } from 'physom';
import { Pool } from '3h-pool';
import { Animation, CanvasNode } from 'canvasom';

/**
 * Type of options of {@link ParticleGroup}.
 */
export interface ParticleGroupOptions<
    ParticleType extends BodyNode<any> = BodyNode<any>,
    Events extends WorldNodeEvents = WorldNodeEvents,
    > extends WorldNodeOptions<Events> {
    /**
     * Particle count in this group.
     * @default 12
     */
    particleCount?: number;
    /**
     * The particle pool to use.
     */
    particlePool: Pool<ParticleType>;
    /**
     * The animation pool to use.
     * (No animation creation during initialization
     * if this is `null`.)
     */
    animationPool: Pool<Animation> | null;
}
/** dts2md break */
/**
 * Class of particle groups.
 */
export class ParticleGroup
    <
    ParticleType extends BodyNode<any> = BodyNode<any>,
    Events extends WorldNodeEvents = WorldNodeEvents,
    >
    extends WorldNode<Events> {
    /** dts2md break */
    /**
     * Constructor of {@link ParticleGroup}.
     */
    constructor(options: ParticleGroupOptions<ParticleType, Events>) {
        super(options);
        this.particleCount = options.particleCount ?? 12;
        this.particlePool = options.particlePool;
        this.animationPool = options.animationPool;
    }
    /** dts2md break */
    /**
     * The particle pool in use.
     */
    readonly particlePool: Pool<ParticleType>;
    /** dts2md break */
    /**
     * The animation pool in use.
     * (No animation creation during initialization
     * if this is `null`.)
     */
    readonly animationPool: Pool<Animation> | null;
    /** dts2md break */
    /**
     * Current particles.
     */
    readonly particles: ParticleType[] = [];
    /** dts2md break */
    /**
     * Current animation.
     */
    animation: Animation | null = null;
    /** dts2md break */
    /**
     * Particle count in this group.
     * @default 12
     */
    particleCount: number;
    /** dts2md break */
    /**
     * Remove particles and animation.
     */
    clearParticleGroup(timeStamp: number) {

        const { particlePool, particles } = this;
        particles.forEach(particle => {
            particlePool.push(particle);
        });
        particles.length = 0;

        const { animation } = this;
        if (animation) {
            animation.stop(timeStamp);
            this.animation = null;
        }

        this.clearChildNodes();
        this.deactivate();

    }
    /** dts2md break */
    /**
     * Initialize particles and animation.
     */
    initParticleGroup(timeStamp: number) {

        const { particlePool, particles, particleCount } = this;

        this.clearParticleGroup(timeStamp);

        for (let i = 0; i < particleCount; i++) {
            const particle = particlePool.pop();
            particles.push(particle);
            this.appendChild(particle as CanvasNode<any>);
        }

        const { animationPool } = this;

        if (animationPool) {
            const animation = animationPool.pop();
            this.animation = animation;
            animation.start(timeStamp);
        }

        this.activate();

    }

}
