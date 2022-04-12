import { BodyNode, BodyNodeOptions, WorldNodeEvents } from 'physom';
import { Vertices, Utils as COMUtils, Animation, Schedule, Timing, AnimationOptions, AnimationEvents } from 'canvasom';
import { ParticleGroup } from './ParticleGroup';
import { Pool } from '3h-pool';
import { pick, random, removeElements } from '3h-utils';

/**
 * Type of particle group processors.
 */
export type ParticleGroupProcessor<
    ParticleType extends BodyNode<any>,
    Events extends WorldNodeEvents,
    > = (particle: ParticleGroup<ParticleType, Events>) => void;
/** dts2md break */
/**
 * Type of options of {@link ParticleManager}.
 */
export type ParticleManagerOptions<
    ParticleType extends BodyNode<any>,
    Events extends WorldNodeEvents,
    > = Partial<{
        /**
         * The particle pool to use.
         * @default
         * new Pool({
         *     create: ParticleManager.createDefaultParticle,
         * })
         */
        particlePool: Pool<ParticleType>;
        /**
         * The animation pool to use.
         * (No animation creation during initialization
         * if this is `null`.)
         * @default
         * new Pool({
         *     create: () => (
         *         new Animation(ParticleManager.defaultAnimationOptions)
         *     ),
         *     clear(animation) {
         *         animation.listenerMap.clear();
         *     },
         * })
         */
        animationPool: Pool<Animation> | null;
        /**
         * The initializer of particle groups.
         * @default ParticleManager.initParticleGroup
         */
        initParticleGroup: ParticleGroupProcessor<ParticleType, Events> | null;
        /**
         * The clearer of particle groups.
         * @default ParticleManager.clearParticleGroup
         */
        clearParticleGroup: ParticleGroupProcessor<ParticleType, Events> | null;
    }>;
/** dts2md break */
/**
 * Class of particle managers.
 */
export class ParticleManager<
    ParticleType extends BodyNode<any> = BodyNode<any>,
    Events extends WorldNodeEvents = WorldNodeEvents,
    > {
    /**
     * Default options of particles.
     * @default
     * {
     *     vertices: Vertices.createRectangle(10, 10),
     *     airFriction: 0.01,
     * }
     */
    static defaultParticleOptions: BodyNodeOptions<any> = {
        vertices: Vertices.createRectangle(10, 10),
        airFriction: 0.01,
    };
    /** dts2md break */
    /**
     * The minimum value of default speed. (inclusive)
     * @default 0.1
     */
    static defaultSpeedFloor = 0.1;
    /** dts2md break */
    /**
     * The maximum value of default speed. (exclusive)
     * @default 0.6
     */
    static defaultSpeedCeiling = 0.6;
    /** dts2md break */
    /**
     * The default color choices of particles.
     */
    static defaultColors = [
        '#F00',
        '#FF0',
        '#0F0',
        '#0FF',
        '#00F',
        '#F0F',
    ];
    /** dts2md break */
    /**
     * Default animation options.
     */
    static defaultAnimationOptions: AnimationOptions<AnimationEvents> = {
        from: 1,
        to: 0,
        duration: 2000,
        timing: Timing.easeOut,
    };
    /** dts2md break */
    /**
     * Default particle creator.
     */
    static createDefaultParticle = () => (
        new BodyNode(this.defaultParticleOptions)
    );
    /** dts2md break */
    /**
     * Default particle group initializer.
     */
    static initParticleGroup: ParticleGroupProcessor<any, any> =
        (group) => {

            group.initParticleGroup(Schedule.getTimeStamp());

            const { particles } = group;

            const deltaAngle = COMUtils.Constants.TWO_PI / group.particles.length;

            particles.forEach((particle, i) => {
                const angle = deltaAngle * i;
                const speed = random(
                    this.defaultSpeedFloor,
                    this.defaultSpeedCeiling,
                );
                particle.offset.set(0, 0);
                particle.velocity.set(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                );
                particle.style.fillStyle = pick(this.defaultColors);
                particle.style.opacity = 1;
            });

            group.animation?.on('update', (event) => {
                particles.forEach(particle => {
                    particle.style.opacity = event.data.currentValue;
                });
            });

        };
    /** dts2md break */
    /**
     * Default particle group clearer.
     */
    static clearParticleGroup: ParticleGroupProcessor<any, any> =
        (group) => {
            group.clearParticleGroup(Schedule.getTimeStamp());
            if (group.parentNode) {
                group.parentNode.removeChild(group);
            }
        };
    /** dts2md break */
    /**
     * Constructor of {@link ParticleManager}.
     */
    constructor(options?: ParticleManagerOptions<ParticleType, Events>) {

        const particlePool = options?.particlePool ?? new Pool({
            create: ParticleManager.createDefaultParticle as (() => ParticleType),
        });
        this.particlePool = particlePool;

        const animationPool = (options?.animationPool !== undefined)
            ? options.animationPool
            : new Pool({
                create: () => (
                    new Animation(ParticleManager.defaultAnimationOptions)
                ),
                clear(animation) {
                    animation.listenerMap.clear();
                },
            });
        this.animationPool = animationPool;

        this.particleGroupPool = new Pool({
            create: () => (
                new ParticleGroup({
                    particlePool,
                    animationPool,
                })
            ),
            init: options?.initParticleGroup ?? ParticleManager.initParticleGroup,
            clear: options?.clearParticleGroup ?? ParticleManager.clearParticleGroup,
        });

    }
    /** dts2md break */
    /**
     * The particle pool in use.
     */
    readonly particlePool: Pool<ParticleType>;
    /** dts2md break */
    /**
     * The particle group pool in use.
     */
    readonly particleGroupPool: Pool<ParticleGroup<ParticleType, Events>>;
    /** dts2md break */
    /**
     * The animation group pool in use.
     * (No animation creation during initialization
     * if this is `null`.)
     */
    readonly animationPool: Pool<Animation> | null;
    /** dts2md break */
    /**
     * Current particle groups.
     */
    readonly particleGroups: ParticleGroup<ParticleType, Events>[] = [];
    /** dts2md break */
    /**
     * Create an initialized particle group.
     */
    createParticleGroup() {
        const group = this.particleGroupPool.pop();
        group.animation?.once('finish', () => {
            this.removeParticleGroup(group);
        });
        this.particleGroups.push(group);
        return group;
    }
    /** dts2md break */
    /**
     * Clear the given particle group and recycle it.
     */
    removeParticleGroup(group: ParticleGroup<ParticleType, Events>) {
        const { particleGroups } = this;
        const index = particleGroups.indexOf(group);
        if (index < 0) {
            throw new Error(
                'the given particle group has already been removed'
            );
        }
        removeElements(particleGroups, index, 1);
        this.particleGroupPool.push(group);
    }
    /** dts2md break */
    /**
     * Remove all particle groups in `particleGroups`.
     */
    clearParticleGroups() {
        const { particleGroups, particleGroupPool } = this;
        particleGroups.forEach(group => {
            particleGroupPool.push(group);
        });
        particleGroups.length = 0;
    }

}
