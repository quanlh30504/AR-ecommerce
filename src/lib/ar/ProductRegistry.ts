import type { IARRenderer, ARProduct, ARObjectType } from './types';
import type { IObjectLoader } from './loaders/IObjectLoader';
import type { ITransformCalculator } from './transforms/ITransformCalculator';
import { CompositeRenderer } from './renderers/CompositeRenderer';
import { Texture2DLoader } from './loaders/Texture2DLoader';
import { Model3DLoader } from './loaders/Model3DLoader';
import { GlassesTransform } from './transforms/GlassesTransform';
import { HatTransform } from './transforms/HatTransform';

export type ARRenderMode = '2d' | '3d';

export interface ProductConfig {
  loaderType: ARRenderMode;
  transformType: string;
}

type LoaderConstructor = new () => IObjectLoader;
type TransformConstructor = new () => ITransformCalculator;

class ProductRegistryImpl {
  private configs = new Map<ARObjectType, ProductConfig>();
  private loaders = new Map<ARRenderMode, LoaderConstructor>();
  private transforms = new Map<string, TransformConstructor>();

  constructor() {
    this.setupDefaults();
  }

  private setupDefaults(): void {
    this.registerLoader('2d', Texture2DLoader);
    this.registerLoader('3d', Model3DLoader);

    this.registerTransform('glasses', GlassesTransform);
    this.registerTransform('hat', HatTransform);

    this.register('glasses', { loaderType: '2d', transformType: 'glasses' });
    this.register('hat', { loaderType: '3d', transformType: 'hat' });
  }

  registerLoader(mode: ARRenderMode, LoaderClass: LoaderConstructor): void {
    this.loaders.set(mode, LoaderClass);
  }

  registerTransform(name: string, TransformClass: TransformConstructor): void {
    this.transforms.set(name, TransformClass);
  }

  register(type: ARObjectType, config: ProductConfig): void {
    this.configs.set(type, config);
  }

  create(product: ARProduct): IARRenderer {
    const config = this.configs.get(product.type);

    if (!config) {
      console.warn(`ProductRegistry: Unknown type "${product.type}", using glasses as fallback`);
      return this.createFallback();
    }

    const loaderMode = product.modelUrl ? '3d' : config.loaderType;
    const LoaderClass = this.loaders.get(loaderMode);
    const TransformClass = this.transforms.get(config.transformType);

    if (!LoaderClass) {
      console.warn(`ProductRegistry: Loader "${loaderMode}" not registered, using 2d fallback`);
      return this.createFallback();
    }

    if (!TransformClass) {
      console.warn(`ProductRegistry: Transform "${config.transformType}" not registered, using glasses fallback`);
      return this.createFallback();
    }

    return new CompositeRenderer(new LoaderClass(), new TransformClass());
  }

  private createFallback(): IARRenderer {
    return new CompositeRenderer(new Texture2DLoader(), new GlassesTransform());
  }

  canRender(product: ARProduct): boolean {
    const config = this.configs.get(product.type);
    if (!config) return false;

    const loaderMode = product.modelUrl ? '3d' : config.loaderType;
    return this.loaders.has(loaderMode) && this.transforms.has(config.transformType);
  }

  getSupportedTypes(): ARObjectType[] {
    return Array.from(this.configs.keys());
  }
}

export const ProductRegistry = new ProductRegistryImpl();

export function createRenderer(product: ARProduct): IARRenderer {
  return ProductRegistry.create(product);
}
