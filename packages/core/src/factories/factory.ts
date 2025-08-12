import { BasicCharacter } from "@/implements/basicChar";
import { CharacterConstructor, CharacterOptions } from "@/types/character";
import {
  StageObjects,
  StageObjectOptions,
  ObjectConstructor,
  isInteractable,
  isCollectible,
} from "@/types/objects";
import { TileConstructor, BaseTile, TileOptions } from "@/types/tiles";

/**
 * Factory for creating objects based on their type
 */
export class ObjectFactory {
  private static objectRegistry = new Map<string, ObjectConstructor<any>>();
  private static idCounter: number = 0;

  /**
   * Registers a new object type with its constructor
   */
  public static register<T extends StageObjects>(
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

    const id: string = this.generateId();
    try {
      const obj = constructor(id, options);

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

  private static generateId(): string {
    return `obj_${this.idCounter++}`;
  }
}

export class TileFactory {
  private static tileRegistry = new Map<string, TileConstructor<any>>();
  private static idCounter: number = 0;

  /**
   * Registers a new tile type with its constructor
   */
  public static register<T extends BaseTile>(type: string, constructor: TileConstructor<T>): void {
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

    const id: string = this.generateId();

    try {
      const obj = constructor(id, options);

      return obj;
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

  private static generateId(): string {
    return `tile_${this.idCounter++}`;
  }
}

export class CharaterFactory {
  private static characterRegistry = new Map<number, CharacterConstructor>();
  private static idCounter: number = 0;

  public static register<T extends CharacterConstructor>(constructor: T): void {
    const id = constructor.prototype.id;
    if (this.characterRegistry.has(id)) {
      throw new Error(`Character with ID "${id}" is already registered.`);
    }
    this.characterRegistry.set(id, constructor);
  }

  public static getRegisteredIds(): number[] {
    return Array.from(this.characterRegistry.keys());
  }

  public static isRegistered(id: number): boolean {
    return this.characterRegistry.has(id);
  }

  public static unregister(id: number): boolean {
    return this.characterRegistry.delete(id);
  }

  public static create(options: CharacterOptions): BasicCharacter {
    const constructor = this.characterRegistry.get(options.id);
    if (!constructor) {
      throw new Error(`Character with ID "${options.id}" is not registered.`);
    }
    const id: number = this.generateId();

    try {
      return constructor(id, options);
    } catch (error) {
      console.error(`Error creating character with ID "${options.id}":`, error);
      throw new Error(`Failed to create character with ID "${options.id}".`);
    }
  }

  public static createFromJSON(jsonData: Record<string, any> | string): BasicCharacter {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (typeof data.id !== "number") {
        console.error("Invalid JSON data: 'id' is required and must be a number.");
        throw new Error("Invalid JSON data: 'id' is required and must be a number.");
      }

      if (!data.id) {
        console.error("Character ID is required in JSON data.");
        throw new Error("Character ID is required in JSON data.");
      }

      return this.create(data);
    } catch (error) {
      console.error("Error creating character from JSON:", error);
      throw new Error("Failed to create character from JSON.");
    }
  }

  private static generateId(): number {
    return this.idCounter++;
  }
}
