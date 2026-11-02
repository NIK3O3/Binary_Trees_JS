"use strict";

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class Stack {
  constructor() {
    this.head = null;
  }

  push(value) {
    this.head = { value, next: this.head };
  }

  pop() {
    const value = this.head.value;
    this.head = this.head.next;
    return value;
  }

  peek() {
    return this.head.value;
  }

  empty() {
    return this.head === null;
  }
}

function visitRange(start, end, action) {
  if (start >= end) return true;
  if (end - start === 1) return action(start) !== false;
  const middle = start + Math.floor((end - start) / 2);
  return visitRange(start, middle, action) && visitRange(middle, end, action);
}

function runRecursively(step) {
  function processBlock(size) {
    if (size === 1) return step();
    const half = size / 2;
    return processBlock(half) && processBlock(half);
  }

  function grow(size) {
    if (!processBlock(size)) return;
    grow(size * 2);
  }

  grow(1);
}

function foldPostorder(root, emptyValue, combine) {
  if (root === null) return emptyValue;

  const frames = new Stack();
  let result = emptyValue;

  function frame(node) {
    return { node, stage: 0, left: emptyValue, right: emptyValue };
  }

  frames.push(frame(root));

  runRecursively(() => {
    if (frames.empty()) return false;
    const current = frames.peek();

    if (current.stage === 0) {
      current.stage = 1;
      if (current.node.left !== null) {
        frames.push(frame(current.node.left));
        return true;
      }
    }

    if (current.stage === 1) {
      if (current.node.left !== null) current.left = result;
      current.stage = 2;
      if (current.node.right !== null) {
        frames.push(frame(current.node.right));
        return true;
      }
    }

    if (current.node.right !== null) current.right = result;
    result = combine(current.node, current.left, current.right);
    frames.pop();
    return true;
  });

  return result;
}

// 1. Дерева однакові лише за збігу значень і структури
function isSameTree(p, q) {
  if (p === null || q === null) return p === q;
  if (p.val !== q.val) return false;

  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

// 2. Порівнюємо ліву та праву половини у дзеркальному порядку
function isSymmetric(root) {
  function mirror(left, right) {
    if (left === null || right === null) return left === right;
    if (left.val !== right.val) return false;

    return mirror(left.left, right.right) && mirror(left.right, right.left);
  }

  return root === null || mirror(root.left, root.right);
}

// 3. Інвертувати дерево на місці, зберігши всі вузли та їхні значення
function invertTree(root) {
  if (root === null) return null;

  const oldLeft = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(oldLeft);
  return root;
}

// 4. Inorder-обхід BST дає значення у відсортованому порядку
function kthSmallest(root, k) {
  const stack = new Stack();
  let current = root;
  let visited = 0;
  let answer;

  runRecursively(() => {
    if (current !== null) {
      stack.push(current);
      current = current.left;
      return true;
    }

    if (stack.empty()) return false;
    const node = stack.pop();
    visited += 1;

    if (visited === k) {
      answer = node.val;
      return false;
    }

    current = node.right;
    return true;
  });

  return answer;
}

function joinTokens(tokens, start = 0, end = tokens.length) {
  if (start >= end) return "";
  if (end - start === 1) return tokens[start];
  const middle = start + Math.floor((end - start) / 2);
  return (
    joinTokens(tokens, start, middle) + "," + joinTokens(tokens, middle, end)
  );
}

// 5. Власний формат: preorder із '#' для кожного порожнього піддерева
function serialize(root) {
  const stack = new Stack();
  const tokens = [];
  stack.push(root);

  runRecursively(() => {
    if (stack.empty()) return false;
    const node = stack.pop();

    if (node === null) {
      tokens[tokens.length] = "#";
    } else {
      tokens[tokens.length] = String(node.val);
      stack.push(node.right);
      stack.push(node.left);
    }

    return true;
  });

  return joinTokens(tokens);
}

function deserialize(data) {
  let index = 0;

  function readToken(token = "") {
    if (index === data.length) return token;
    const character = data[index];
    index += 1;
    if (character === ",") return token;
    return readToken(token + character);
  }

  const slots = new Stack();
  let root = null;
  slots.push({ parent: null, side: null });

  runRecursively(() => {
    if (slots.empty()) return false;
    const slot = slots.pop();
    const token = readToken();
    const node = token === "#" ? null : new TreeNode(Number(token));

    if (slot.parent === null) root = node;
    else slot.parent[slot.side] = node;

    if (node !== null) {
      slots.push({ parent: node, side: "right" });
      slots.push({ parent: node, side: "left" });
    }

    return true;
  });

  return root;
}

// 6. Найкращий шлях через вузол може включати обидві його гілки
function maxPathSum(root) {
  let maximum = -Infinity;

  foldPostorder(root, 0, (node, leftGain, rightGain) => {
    const left = leftGain > 0 ? leftGain : 0;
    const right = rightGain > 0 ? rightGain : 0;
    const throughNode = node.val + left + right;
    if (throughNode > maximum) maximum = throughNode;

    return node.val + (left > right ? left : right);
  });

  return maximum;
}

// 7. Три стани вузла: потребує камери, має камеру, вже покритий
function minCameraCover(root) {
  const NEEDS_CAMERA = 0;
  const HAS_CAMERA = 1;
  const COVERED = 2;
  let cameras = 0;

  const rootState = foldPostorder(root, COVERED, (node, left, right) => {
    if (left === NEEDS_CAMERA || right === NEEDS_CAMERA) {
      cameras += 1;
      return HAS_CAMERA;
    }

    if (left === HAS_CAMERA || right === HAS_CAMERA) return COVERED;
    return NEEDS_CAMERA;
  });

  if (rootState === NEEDS_CAMERA) cameras += 1;
  return cameras;
}

// 8. Власне сортування злиттям за стовпцем, рядком і значенням
function verticalTraversal(root) {
  const records = [];

  function collect(node, row, column) {
    if (node === null) return;
    records[records.length] = { row, column, value: node.val };
    collect(node.left, row + 1, column - 1);
    collect(node.right, row + 1, column + 1);
  }

  collect(root, 0, 0);
  const buffer = new Array(records.length);

  function lessOrEqual(a, b) {
    if (a.column !== b.column) return a.column < b.column;
    if (a.row !== b.row) return a.row < b.row;
    return a.value <= b.value;
  }

  function sortRange(start, end) {
    if (end - start <= 1) return;
    const middle = start + Math.floor((end - start) / 2);
    sortRange(start, middle);
    sortRange(middle, end);
    let left = start;
    let right = middle;

    visitRange(start, end, (write) => {
      if (
        left < middle &&
        (right >= end || lessOrEqual(records[left], records[right]))
      ) {
        buffer[write] = records[left];
        left += 1;
      } else {
        buffer[write] = records[right];
        right += 1;
      }
    });

    visitRange(start, end, (position) => {
      records[position] = buffer[position];
    });
  }

  sortRange(0, records.length);
  const answer = [];
  let previousColumn;
  let group;

  visitRange(0, records.length, (index) => {
    const record = records[index];
    if (index === 0 || record.column !== previousColumn) {
      group = [];
      answer[answer.length] = group;
      previousColumn = record.column;
    }
    group[group.length] = record.value;
  });

  return answer;
}

// 9. Розібрати тире й цифри одним проходом; path зберігає предків за глибиною
function recoverFromPreorder(traversal) {
  const path = [];
  let root = null;
  let depth = 0;
  let value = 0;
  let readingValue = false;

  function attachNode() {
    const node = new TreeNode(value);

    if (depth === 0) {
      root = node;
    } else {
      const parent = path[depth - 1];
      if (parent.left === null) parent.left = node;
      else parent.right = node;
    }

    path[depth] = node;
    path.length = depth + 1;
    depth = 0;
    value = 0;
    readingValue = false;
  }

  visitRange(0, traversal.length, (index) => {
    if (traversal[index] === "-") {
      if (readingValue) attachNode();
      depth += 1;
    } else {
      value = value * 10 + traversal.charCodeAt(index) - 48;
      readingValue = true;
    }
  });

  if (readingValue) attachNode();
  return root;
}

function treeFromArray(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const parents = [root];
  let read = 0;
  let index = 1;

  runRecursively(() => {
    if (index >= values.length || read === parents.length) return false;
    const parent = parents[read];
    read += 1;
    const left = values[index];
    index += 1;

    if (left !== null) {
      parent.left = new TreeNode(left);
      parents[parents.length] = parent.left;
    }

    if (index < values.length) {
      const right = values[index];
      index += 1;
      if (right !== null) {
        parent.right = new TreeNode(right);
        parents[parents.length] = parent.right;
      }
    }

    return true;
  });

  return root;
}

function treeToArray(root) {
  if (root === null) return [];
  const values = [];
  const pending = [root];
  let read = 0;

  runRecursively(() => {
    if (read === pending.length) return false;
    const node = pending[read];
    read += 1;

    if (node === null) {
      values[values.length] = null;
    } else {
      values[values.length] = node.val;
      pending[pending.length] = node.left;
      pending[pending.length] = node.right;
    }

    return true;
  });

  runRecursively(() => {
    if (values.length === 0 || values[values.length - 1] !== null) return false;
    values.length -= 1;
    return true;
  });

  return values;
}

console.log(
  "1:",
  isSameTree(treeFromArray([1, 2, 3]), treeFromArray([1, 2, 3])),
);
console.log(
  "1:",
  isSameTree(treeFromArray([1, 2]), treeFromArray([1, null, 2])),
);
console.log(
  "1:",
  isSameTree(treeFromArray([1, 2, 1]), treeFromArray([1, 1, 2])),
);

console.log("2:", isSymmetric(treeFromArray([1, 2, 2, 3, 4, 4, 3])));
console.log("2:", isSymmetric(treeFromArray([1, 2, 2, null, 3, null, 3])));

console.log(
  "3:",
  treeToArray(invertTree(treeFromArray([4, 2, 7, 1, 3, 6, 9]))),
);
console.log("3:", treeToArray(invertTree(treeFromArray([2, 1, 3]))));
console.log("3:", treeToArray(invertTree(null)));

console.log("4:", kthSmallest(treeFromArray([3, 1, 4, null, 2]), 1));
console.log(
  "4:",
  kthSmallest(treeFromArray([5, 3, 6, 2, 4, null, null, 1]), 3),
);

const encoded = serialize(treeFromArray([1, 2, 3, null, null, 4, 5]));
console.log("5: serialize:", encoded);
console.log("5: deserialize:", treeToArray(deserialize(encoded)));
console.log("5: empty:", treeToArray(deserialize(serialize(null))));

console.log("6:", maxPathSum(treeFromArray([1, 2, 3])));
console.log("6:", maxPathSum(treeFromArray([-10, 9, 20, null, null, 15, 7])));

console.log("7:", minCameraCover(treeFromArray([0, 0, null, 0, 0])));
console.log(
  "7:",
  minCameraCover(treeFromArray([0, 0, null, 0, null, 0, null, null, 0])),
);

console.log(
  "8:",
  verticalTraversal(treeFromArray([3, 9, 20, null, null, 15, 7])),
);
console.log("8:", verticalTraversal(treeFromArray([1, 2, 3, 4, 5, 6, 7])));
console.log("8:", verticalTraversal(treeFromArray([1, 2, 3, 4, 6, 5, 7])));

console.log("9:", treeToArray(recoverFromPreorder("1-2--3--4-5--6--7")));
console.log("9:", treeToArray(recoverFromPreorder("1-2--3---4-5--6---7")));
console.log("9:", treeToArray(recoverFromPreorder("1-401--349---90--88")));
