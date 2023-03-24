const foo = () => {};
// Define an interface
export interface Person {
  name: string;
  age: number;
  adress: Address;
}

// Define a type alias
export type Address = {
  street: string;
  city: string;
  zipCode: number;
  city1: string;
};

export default foo;
