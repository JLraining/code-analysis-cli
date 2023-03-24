// Import an external module
import foo from '../shared';
import * as foo1 from '../shared';
import { Person as Person1 } from '@shared';
import { Address } from '/Users/li.jiang/code/rn-2.x/sea-cli/src/test/shared/index.ts';

// Define an enum type
enum Color {
  Red,
  Green,
  Blue,
}

// Define a function type
type Adder = (x: number, y: number) => number;

// Define a class
class Animal {
  constructor(private name: string) {}

  speak(): void {
    console.log(`I'm a ${this.name}`);
  }
}

// Export module members
export { Color, Person1, Address, Adder, Animal };

// Use module members
const c: Color = Color.Red;
const p: Person1 = { name: 'John', age: 30 };
const a: Address = { street: '123 Main St', city: 'New York', zipCode: 10001 };
const add: Adder = (x, y) => x + y;
const cat = new Animal('cat');
cat.speak();

foo();
Address();
Address();
foo1();
