import { BasicCharacter } from "@/implements/basicChar";
import { CharacterDirection, CharacterOptions } from "@/types/character";
import { Position } from "@/types/commonType";
import {
  isInteractable,
  isCollectible,
  ObjectOptions,
  IInteractable,
  ICollectible,
  StageObject,
} from "@/types/objects";
import { BaseTile, TileOptions } from "@/types/tiles";

/**
 * Factory for creating objects based on their type
 */
export class ObjectFactory {
  private objectRegistry = new Map<string, any>();
  private idCounter: number;
  private static instance: ObjectFactory;

  private constructor() {
    this.objectRegistry = new Map<string, any>();
    this.idCounter = 0;
  }

  public static getInstance(): ObjectFactory {
    if (!ObjectFactory.instance) {
      ObjectFactory.instance = new ObjectFactory();
    }
    return ObjectFactory.instance;
  }

  /**
   * Registers a new object type with its constructor
   */
  public register(type: string, constructor: any): void {
    if (this.objectRegistry.has(type)) {
      throw new Error(`Object type "${type}" is already registered.`);
    }

    this.objectRegistry.set(type, constructor);
  }

  /** Returns an array of all registered object types */
  public getRegisteredTypes(): string[] {
    return Array.from(this.objectRegistry.keys());
  }

  /** Checks if an object type is registered */
  public isRegistered(type: string): boolean {
    return this.objectRegistry.has(type);
  }

  /** Unregisters an object type */
  public unregister(type: string): boolean {
    return this.objectRegistry.delete(type);
  }

  /** Creates a new object of the specified type */
  public create(type: string, position: Position): IInteractable | ICollectible {
    const constructor = this.objectRegistry.get(type);

    if (!constructor) {
      throw new Error(`Object type "${type}" is not registered.`);
    }

    const id: string = this.generateId();
    try {
      const obj = constructor(id, position);

      if (!isInteractable(obj) && !isCollectible(obj)) {
        throw new Error(`Object type "${type}" must implement IInteractable or ICollectible.`);
      }

      return obj;
    } catch (error) {
      console.error(`Error creating object of type "${type}":`, error);
      throw new Error(`Failed to create object of type "${type}".`);
    }
  }

  public createFromJSON(data: { type: string; position: Position }[]): StageObject[] {
    try {
      const objects: StageObject[] = [];
      data.forEach((obj) => {
        if (typeof obj.type !== "string") {
          console.error("Invalid JSON data: 'type' is required and must be a string.");
          throw new Error("Invalid JSON data: 'type' is required and must be a string.");
        }

        objects.push(this.create(obj.type, obj.position));
      });

      return objects;
    } catch (error) {
      console.error("Error creating object from JSON:", error);
      throw new Error("Failed to create object from JSON.");
    }
  }

  private generateId(): string {
    return `obj_${this.idCounter++}`;
  }
}

export class TileFactory {
  private tileRegistry = new Map<string, any>();
  private idCounter: number;
  private static instance: TileFactory;

  private constructor() {
    this.tileRegistry = new Map<string, any>();
    this.idCounter = 0;
  }

  public static getInstance(): TileFactory {
    if (!TileFactory.instance) {
      TileFactory.instance = new TileFactory();
    }
    return TileFactory.instance;
  }

  /**
   * Registers a new tile type with its constructor
   */
  public register(type: string, constructor: any): void {
    if (this.tileRegistry.has(type)) {
      throw new Error(`Tile type "${type}" is already registered.`);
    }
    this.tileRegistry.set(type, constructor);
  }

  /** Returns an array of all registered tile types */
  public getRegisteredTypes(): string[] {
    return Array.from(this.tileRegistry.keys());
  }

  /** Checks if a tile type is registered */
  public isRegistered(type: string): boolean {
    return this.tileRegistry.has(type);
  }

  /** Unregisters a tile type */
  public unregister(type: string): boolean {
    return this.tileRegistry.delete(type);
  }

  /** Creates a new tile of the specified type */
  public create(type: string, position: Position): BaseTile {
    const constructor = this.tileRegistry.get(type);
    if (!constructor) {
      throw new Error(`Tile type "${type}" is not registered.`);
    }

    const id: string = this.generateId();

    try {
      const obj = constructor(id, position);

      return obj;
    } catch (error) {
      console.error(`Error creating tile of type "${type}":`, error);
      throw new Error(`Failed to create tile of type "${type}".`);
    }
  }

  public createFromJSON(data: { type: string; position: Position }[]): BaseTile[] {
    try {
      return data.map((item) => {
        if (typeof item.type !== "string") {
          console.error("Invalid JSON data: 'type' is required and must be a string.");
          throw new Error("Invalid JSON data: 'type' is required and must be a string.");
        }

        if (!item.type) {
          console.error("Tile type is required in JSON data.");
          throw new Error("Tile type is required in JSON data.");
        }

        return this.create(item.type, item.position);
      });
    } catch (error) {
      console.error("Error creating tile from JSON:", error);
      throw new Error("Failed to create tile from JSON.");
    }
  }

  private generateId(): string {
    return `tile_${this.idCounter++}`;
  }
}

export class CharacterFactory {
  private characterRegistry;
  private idCounter: number;
  private static instance: CharacterFactory;

  private constructor() {
    this.idCounter = 0;
    this.characterRegistry = new Map<string, any>();
  }

  public static getInstance(): CharacterFactory {
    if (!CharacterFactory.instance) {
      CharacterFactory.instance = new CharacterFactory();
    }
    return CharacterFactory.instance;
  }

  public register(type: string, constructor: any): void {
    if (this.characterRegistry.has(type)) {
      throw new Error(`Character with type "${type}" is already registered.`);
    }
    this.characterRegistry.set(type, constructor);
  }

  public getRegisteredIds(): string[] {
    return Array.from(this.characterRegistry.keys());
  }

  public isRegistered(type: string): boolean {
    return this.characterRegistry.has(type);
  }

  public unregister(type: string): boolean {
    return this.characterRegistry.delete(type);
  }

  public create(type: string, position: Position, direction: CharacterDirection): BasicCharacter {
    const constructor = this.characterRegistry.get(type);
    if (!constructor) {
      throw new Error(`Character with type "${type}" is not registered.`);
    }
    const id: number = this.generateId();

    try {
      return constructor(id, position, direction);
    } catch (error) {
      console.error(`Error creating character with ID "${id}":`, error);
      throw new Error(`Failed to create character with ID "${id}".`);
    }
  }

  public createFromJSON(
    data: { type: string; position: Position; direction: CharacterDirection }[]
  ): BasicCharacter[] {
    try {
      return data.map((item) => {
        if (typeof item.type !== "string") {
          console.error("Invalid JSON data: 'type' is required and must be a string.");
          throw new Error("Invalid JSON data: 'type' is required and must be a string.");
        }

        if (!item.type) {
          console.error("Character type is required in JSON data.");
          throw new Error("Character type is required in JSON data.");
        }

        return this.create(item.type, item.position, item.direction);
      });
    } catch (error) {
      console.error("Error creating character from JSON:", error);
      throw new Error("Failed to create character from JSON.");
    }
  }

  private generateId(): number {
    return this.idCounter++;
  }
}
