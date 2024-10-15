class Node<T> {
  value: T;
  children: Node<T>[];

  constructor(value: T) {
    this.value = value;
    this.children = [];
  }
}

class Tree<T> {
  root: Node<T> | null;

  constructor() {
    this.root = null;
  }

  add(value: T, parentValue: T | null = null): void {
    const newNode = new Node(value);

    if (this.root === null) {
      this.root = newNode;
    } else {
      const parentNode = this.findBFS(parentValue);
      if (parentNode) {
        let nodeObj: any = {};
        if (Array.isArray(newNode.value.value)) {
          nodeObj = {
            value: {
              key: newNode.value.key,
              id: newNode.value.id,
              value: [],
              parentId: parentValue,
            },
            children: [],
          };
        } else {
          nodeObj = { ...newNode, parentId: parentValue };
        }
        parentNode.children.push(nodeObj);
      } else {
        throw new Error("Cannot add node to a non-existent parent.");
      }
    }
  }

  updateNodeValue(value: T | null, id: number) {
    if (this.root === null || id === null) {
      return null;
    }

    const queue: Node<T>[] = [this.root];

    while (queue.length) {
      const node = queue.shift();
      if (node && node.value?.id === id) {
        // if (typeof value?.value === "string") {
        node.value = value;
        // }
        // return node;
      }
      if (node) {
        for (const child of node.children) {
          queue.push(child);
        }
      }
    }

    // return null;
  }

  findBFS(value: T | null): Node<T> | null {
    if (this.root === null || value?.id === null) {
      return null;
    }

    const queue: Node<T>[] = [this.root];

    while (queue.length) {
      const node = queue.shift();
      if (node && node.value?.id === value?.id) {
        return node;
      }
      if (node) {
        for (const child of node.children) {
          queue.push(child);
        }
      }
    }

    return null;
  }

  traverseBFS(): T[] {
    const result: T[] = [];
    if (this.root === null) {
      return result;
    }

    const queue: Node<T>[] = [this.root];

    while (queue.length) {
      const node = queue.shift();
      if (node) {
        result.push(node.value);
        for (const child of node.children) {
          queue.push(child);
        }
      }
    }

    return result;
  }

  traverseDFS(): T[] {
    const result: T[] = [];
    if (this.root === null) {
      return result;
    }

    const traverse = (node: Node<T>): void => {
      result.push(node.value);
      node.children.forEach((child) => traverse(child));
    };

    traverse(this.root);
    return result;
  }

  delete(value: T): boolean {
    if (this.root === null) {
      return false;
    }

    if (this.root.value?.id === value?.id) {
      this.root = null;
      return true;
    }

    const queue: Node<T>[] = [this.root];

    while (queue.length) {
      const node = queue.shift();
      if (node) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].value?.id === value?.id) {
            node.children.splice(i, 1);
            return true;
          }
          queue.push(node.children[i]);
        }
      }
    }

    return false;
  }
}

export default Tree;
