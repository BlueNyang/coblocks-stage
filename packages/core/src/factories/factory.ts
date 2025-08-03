import {
  StageObjects,
  StageObjectOptions,
  ObjectConstructor,
  ObjectOptions,
  isInteractable,
  isCollectible,
} from "@/types/objects";
import { TileConstructor, BaseTile, TileOptions } from "@/types/tiles";

/**
 * Factory for creating objects based on their type
 */
export class ObjectFactory {
  private static objectRegistry = new Map<string, ObjectConstructor<any>>();

  /**
   * Registers a new object type with its constructor
   */
  public static register<T extends ObjectOptions>(
    type: string,
    constructor: ObjectConstructor<T>
  ): void {
    if (this.objectRegistry.has(type)) {
      throw new Error(`Object type "${type}" is already registered.`);
    }
    this.objectRegistry.set(type, constructor);
  }

  /** Returns an array of all registered object types */
  public static getRegisteredTypes(): string[] {
    return Array.from(this.objectRegistry.keys());
  }

  /** Checks if an object type is registered */
  public static isRegistered(type: string): boolean {
    return this.objectRegistry.has(type);
  }

  /** Unregisters an object type */
  public static unregister(type: string): boolean {
    return this.objectRegistry.delete(type);
  }

  /** Creates a new object of the specified type */
  public static create(type: string, options: StageObjectOptions): StageObjects {
    const constructor = this.objectRegistry.get(type);
    if (!constructor) {
      throw new Error(`Object type "${type}" is not registered.`);
    }

    try {
      const obj = new constructor(options);

      if (!isInteractable(obj) && !isCollectible(obj)) {
        throw new Error(`Object type "${type}" must implement IInteractable or ICollectible.`);
      }

      return obj;
    } catch (error) {
      console.error(`Error creating object of type "${type}":`, error);
      throw new Error(`Failed to create object of type "${type}".`);
    }
  }

  public static createFromJSON(jsonData: Record<string, any> | string): StageObjects {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (typeof data.type !== "string") {
        console.error("Invalid JSON data: 'type' is required and must be a string.");
        throw new Error("Invalid JSON data: 'type' is required and must be a string.");
      }

      if (!data.type) {
        console.error("Object type is required in JSON data.");
        throw new Error("Object type is required in JSON data.");
      }

      return this.create(data.type, data);
    } catch (error) {
      console.error("Error creating object from JSON:", error);
      throw new Error("Failed to create object from JSON.");
    }
  }
}

export class TileFactory {
  private static tileRegistry = new Map<string, TileConstructor<any>>();

  /**
   * Registers a new tile type with its constructor
   */
  public static register<T extends TileOptions>(
    type: string,
    constructor: TileConstructor<T>
  ): void {
    if (this.tileRegistry.has(type)) {
      throw new Error(`Tile type "${type}" is already registered.`);
    }
    this.tileRegistry.set(type, constructor);
  }

  /** Returns an array of all registered tile types */
  public static getRegisteredTypes(): string[] {
    return Array.from(this.tileRegistry.keys());
  }

  /** Checks if a tile type is registered */
  public static isRegistered(type: string): boolean {
    return this.tileRegistry.has(type);
  }

  /** Unregisters a tile type */
  public static unregister(type: string): boolean {
    return this.tileRegistry.delete(type);
  }

  /** Creates a new tile of the specified type */
  public static create(type: string, options: TileOptions): BaseTile {
    const constructor = this.tileRegistry.get(type);
    if (!constructor) {
      throw new Error(`Tile type "${type}" is not registered.`);
    }

    try {
      return new constructor(options);
    } catch (error) {
      console.error(`Error creating tile of type "${type}":`, error);
      throw new Error(`Failed to create tile of type "${type}".`);
    }
  }

  public static createFromJSON(jsonData: Record<string, any> | string): BaseTile {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (typeof data.type !== "string") {
        console.error("Invalid JSON data: 'type' is required and must be a string.");
        throw new Error("Invalid JSON data: 'type' is required and must be a string.");
      }

      if (!data.type) {
        console.error("Tile type is required in JSON data.");
        throw new Error("Tile type is required in JSON data.");
      }

      return this.create(data.type, data);
    } catch (error) {
      console.error("Error creating tile from JSON:", error);
      throw new Error("Failed to create tile from JSON.");
    }
  }
}
