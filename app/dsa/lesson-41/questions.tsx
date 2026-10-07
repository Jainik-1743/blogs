import Problem from "@/components/dsa/Problem";

/** Lesson 41 practice questions: binary trees and traversals. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Binary tree preorder traversal"
        level="Easy"
        examples={[
          { input: "root = [1, null, 2, 3]", output: "[1, 2, 3]", why: "Visit 1, then its left side (nothing), then its right side: node 2, whose left child 3 comes next." },
          { input: "root = [1, 2, 3, 4, 5]", output: "[1, 2, 4, 5, 3]", why: "Node first, then the entire left subtree (2, 4, 5), then the right subtree (3)." },
          { input: "root = []", output: "[]", why: "An empty tree has nothing to visit." },
        ]}
        hints={[
          <>Preorder means &quot;node, left subtree, right subtree&quot;. Write the node down <em>before</em> the recursive calls.</>,
          <>Without recursion, use a stack. Which child must you push first so the other comes out first?</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>If the node is null, stop. Otherwise push its value, then walk the left subtree, then the right subtree.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function preorderTraversal(root) {
  const out = [];
  function walk(node) {
    if (node === null) return;
    out.push(node.val);
    walk(node.left);
    walk(node.right);
  }
  walk(root);
  return out;
}

console.log(preorderTraversal(buildTree([1, null, 2, 3])));  // [1, 2, 3]
console.log(preorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [1, 2, 4, 5, 3]
console.log(preorderTraversal(buildTree([])));              // []`,
            explain: <p>O(n) time, O(h) space for the call stack, where h is the height (up to n for a chain).</p>,
          },
          {
            name: "Explicit stack",
            idea: (
              <ol>
                <li>Start with the root on a stack.</li>
                <li>Pop a node, record it, then push its right child and then its left child.</li>
                <li>The left child is on top, so it is processed next, and the whole left subtree is finished before the right one is touched.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function preorderTraversal(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}

console.log(preorderTraversal(buildTree([1, null, 2, 3])));  // [1, 2, 3]
console.log(preorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [1, 2, 4, 5, 3]`,
            explain: <p>O(n) time. Each level of the tree leaves at most one waiting sibling on the stack, so it holds at most about h + 1 nodes: O(h) space, and no recursion depth limit to worry about.</p>,
          },
        ]}
        compare={<p>Write the recursive one first; it is three lines. If asked &quot;without recursion&quot;, switch to the stack. (LeetCode 144.)</p>}
      >
        <p>Return the preorder traversal of a binary tree&apos;s node values.</p>
      </Problem>

      <Problem
        n={2}
        title="Binary tree inorder traversal"
        level="Easy"
        examples={[
          { input: "root = [1, null, 2, 3]", output: "[1, 3, 2]", why: "1 has no left side, so it is first. Then the left subtree of 2 (just 3), then 2 itself." },
          { input: "root = [1, 2, 3, 4, 5]", output: "[4, 2, 5, 1, 3]", why: "Left subtree (4, 2, 5), then the root 1, then the right subtree (3)." },
        ]}
        hints={[
          <>Inorder means &quot;left subtree, node, right subtree&quot;. Record the node <em>between</em> the two recursive calls.</>,
          <>Iteratively: dive left, pushing nodes. When you cannot go further left, pop, record, and move to the right child.</>,
          <>For O(1) extra space there is a clever trick (Morris traversal) that temporarily links each node&apos;s in-order predecessor back to it.</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>Walk left, record the node, walk right.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function inorderTraversal(root) {
  const out = [];
  function walk(node) {
    if (node === null) return;
    walk(node.left);
    out.push(node.val);
    walk(node.right);
  }
  walk(root);
  return out;
}

console.log(inorderTraversal(buildTree([1, null, 2, 3])));  // [1, 3, 2]
console.log(inorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 2, 5, 1, 3]`,
            explain: <p>O(n) time, O(h) space.</p>,
          },
          {
            name: "Explicit stack",
            idea: (
              <ol>
                <li>Keep a pointer <code>cur</code> and a stack.</li>
                <li>While <code>cur</code> exists, push it and move to its left child.</li>
                <li>When it is null, pop the top of the stack: that is the next node in order. Record it and set <code>cur</code> to its right child.</li>
                <li>Stop when both <code>cur</code> is null and the stack is empty.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function inorderTraversal(root) {
  const out = [];
  const stack = [];
  let cur = root;
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}

console.log(inorderTraversal(buildTree([1, null, 2, 3])));  // [1, 3, 2]
console.log(inorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 2, 5, 1, 3]`,
            explain: <p>O(n) time, O(h) space. Every node is pushed once and popped once.</p>,
          },
          {
            name: "Morris traversal (O(1) extra space)",
            idea: (
              <ol>
                <li>If the current node has no left child, record it and go right.</li>
                <li>Otherwise find its <em>predecessor</em>: the rightmost node of its left subtree.</li>
                <li>If the predecessor&apos;s right link is empty, point it back at the current node (a temporary thread) and go left.</li>
                <li>If it already points at the current node, we have just finished the left side: remove the thread, record the current node, and go right.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function inorderTraversal(root) {
  const out = [];
  let cur = root;
  while (cur !== null) {
    if (cur.left === null) {
      out.push(cur.val);
      cur = cur.right;
    } else {
      let pred = cur.left;
      while (pred.right !== null && pred.right !== cur) pred = pred.right;
      if (pred.right === null) {
        pred.right = cur;          // thread: a way back once the left side is done
        cur = cur.left;
      } else {
        pred.right = null;         // second arrival: undo the thread
        out.push(cur.val);
        cur = cur.right;
      }
    }
  }
  return out;
}

console.log(inorderTraversal(buildTree([1, null, 2, 3])));  // [1, 3, 2]
console.log(inorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 2, 5, 1, 3]`,
            explain: <p>Still O(n) time (each edge is walked at most twice) but only O(1) extra space, and the tree is restored by the end. It briefly modifies the tree, so it is not safe if other code reads the tree at the same time. Know it exists; the stack version is what interviews expect.</p>,
          },
        ]}
        compare={<p>Recursive first, iterative stack if recursion is not allowed, and mention Morris if they ask for O(1) space. (LeetCode 94.)</p>}
      >
        <p>Return the inorder traversal of a binary tree&apos;s node values.</p>
      </Problem>

      <Problem
        n={3}
        title="Binary tree postorder traversal"
        level="Easy"
        examples={[
          { input: "root = [1, null, 2, 3]", output: "[3, 2, 1]", why: "Finish the subtree of 2 (3, then 2) before the root 1." },
          { input: "root = [1, 2, 3, 4, 5]", output: "[4, 5, 2, 3, 1]", why: "Both children before their parent, all the way up." },
        ]}
        hints={[
          <>Record the node <em>after</em> both recursive calls.</>,
          <>Postorder (left, right, node) reversed is (node, right, left). That is preorder with the children swapped.</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>Walk left, walk right, then record the node.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function postorderTraversal(root) {
  const out = [];
  function walk(node) {
    if (node === null) return;
    walk(node.left);
    walk(node.right);
    out.push(node.val);
  }
  walk(root);
  return out;
}

console.log(postorderTraversal(buildTree([1, null, 2, 3])));  // [3, 2, 1]
console.log(postorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 5, 2, 3, 1]`,
            explain: <p>O(n) time, O(h) space.</p>,
          },
          {
            name: "Reverse a modified preorder",
            idea: <p>Run an iterative preorder that goes node, then <em>right</em>, then left (push left first). Reverse the output to get left, right, node.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function postorderTraversal(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    out.push(node.val);
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();
}

console.log(postorderTraversal(buildTree([1, null, 2, 3])));  // [3, 2, 1]
console.log(postorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 5, 2, 3, 1]`,
            explain: <p>O(n) time and space. Simple and hard to get wrong, but it records nodes in the wrong order and fixes it at the end.</p>,
          },
          {
            name: "One stack, remember the last node visited",
            idea: (
              <ol>
                <li>Dive left, pushing nodes, as in iterative inorder.</li>
                <li>Peek at the top. If it has a right child we have not handled yet, move to that child.</li>
                <li>Otherwise both sides are done: record the node, pop it, and remember it in <code>last</code>.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function postorderTraversal(root) {
  const out = [];
  const stack = [];
  let cur = root;
  let last = null;                     // the node we most recently finished
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {
      stack.push(cur);
      cur = cur.left;
    }
    const top = stack[stack.length - 1];
    if (top.right !== null && top.right !== last) {
      cur = top.right;                 // the right side is not done yet
    } else {
      out.push(top.val);
      last = stack.pop();
    }
  }
  return out;
}

console.log(postorderTraversal(buildTree([1, null, 2, 3])));  // [3, 2, 1]
console.log(postorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 5, 2, 3, 1]`,
            explain: <p>O(n) time, O(h) space, and the output is built in the right order. The <code>last</code> pointer is what tells us we are returning from the right child rather than arriving for the first time.</p>,
          },
        ]}
        compare={<p>Recursion by default. For the iterative version the reverse-preorder trick is the easiest to remember under pressure. (LeetCode 145.)</p>}
      >
        <p>Return the postorder traversal of a binary tree&apos;s node values.</p>
      </Problem>

      <Problem
        n={4}
        title="Maximum depth of binary tree"
        level="Easy"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3", why: "The longest path is 3, 20, 15 (three nodes)." },
          { input: "root = [1, null, 2]", output: "2", why: "A chain of two nodes." },
          { input: "root = []", output: "0", why: "An empty tree has depth 0." },
        ]}
        hints={[
          <>If you knew the depth of the left and right subtrees, how would you get the depth of this tree?</>,
          <>What is the depth of an empty tree?</>,
        ]}
        approaches={[
          {
            name: "Recursion (depth from the bottom)",
            idea: <p>Depth of null is 0. Depth of a node is 1 plus the larger depth of its two children.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function maxDepth(root) {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

console.log(maxDepth(buildTree([3, 9, 20, null, null, 15, 7]))); // 3
console.log(maxDepth(buildTree([1, null, 2])));                  // 2
console.log(maxDepth(buildTree([])));                            // 0`,
            explain: <p>O(n) time, O(h) space. Each node asks its children for their answers and adds itself: this is postorder thinking.</p>,
          },
          {
            name: "Explicit stack carrying the depth",
            idea: <p>Push <code>[node, depth]</code> pairs. Every time a node is popped, update the best depth seen, then push its children with depth + 1.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function maxDepth(root) {
  if (root === null) return 0;
  let best = 0;
  const stack = [[root, 1]];
  while (stack.length > 0) {
    const [node, depth] = stack.pop();
    best = Math.max(best, depth);
    if (node.left) stack.push([node.left, depth + 1]);
    if (node.right) stack.push([node.right, depth + 1]);
  }
  return best;
}

console.log(maxDepth(buildTree([3, 9, 20, null, null, 15, 7]))); // 3
console.log(maxDepth(buildTree([1, null, 2])));                  // 2
console.log(maxDepth(buildTree([])));                            // 0`,
            explain: <p>O(n) time. Here the depth travels <em>down</em> with the stack entry instead of coming up from the recursion. Works for very deep trees.</p>,
          },
        ]}
        compare={<p>The two-line recursion. (LeetCode 104.) Lesson 42 adds a third way: count the levels with a queue.</p>}
      >
        <p>Return the maximum depth of a binary tree: the number of <em>nodes</em> along the longest path from the root down to a leaf.</p>
      </Problem>

      <Problem
        n={5}
        title="Invert binary tree"
        level="Easy"
        examples={[
          { input: "root = [4, 2, 7, 1, 3, 6, 9]", output: "[4, 7, 2, 9, 6, 3, 1]", why: "At every node the left and right children swap places, so the tree becomes its mirror image." },
          { input: "root = [2, 1, 3]", output: "[2, 3, 1]", why: "Only the root has children to swap." },
          { input: "root = []", output: "[]", why: "Nothing to invert." },
        ]}
        hints={[
          <>What does one node have to do? Swap its two children.</>,
          <>Is it enough to swap at the root only? The children themselves must be inverted too.</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: (
              <ol>
                <li>If the node is null, return null.</li>
                <li>Invert the left subtree and the right subtree.</li>
                <li>Put the inverted right subtree on the left and vice versa.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

// Tree -> level-order array with null gaps (trailing nulls trimmed), for printing.
function toList(root) {
  const out = [], queue = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop();
  return out;
}

function invertTree(root) {
  if (root === null) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}

console.log(toList(invertTree(buildTree([4, 2, 7, 1, 3, 6, 9])))); // [4, 7, 2, 9, 6, 3, 1]
console.log(toList(invertTree(buildTree([2, 1, 3]))));             // [2, 3, 1]
console.log(toList(invertTree(buildTree([]))));                    // []`,
            explain: <p>O(n) time, O(h) space. It modifies the tree in place and returns the same root.</p>,
          },
          {
            name: "Explicit stack",
            idea: <p>Pop a node, swap its children, push whichever children exist. Order does not matter because every node just needs its own swap.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

// Tree -> level-order array with null gaps (trailing nulls trimmed), for printing.
function toList(root) {
  const out = [], queue = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop();
  return out;
}

function invertTree(root) {
  if (root === null) return null;
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    const left = node.left;
    node.left = node.right;
    node.right = left;
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return root;
}

console.log(toList(invertTree(buildTree([4, 2, 7, 1, 3, 6, 9])))); // [4, 7, 2, 9, 6, 3, 1]
console.log(toList(invertTree(buildTree([2, 1, 3]))));             // [2, 3, 1]`,
            explain: <p>O(n) time, O(h) space. Any traversal order works, including the queue-based one from the next lesson.</p>,
          },
        ]}
        compare={<p>Recursion: it reads exactly like the definition. (LeetCode 226.)</p>}
      >
        <p>Invert a binary tree (swap the left and right child of every node) and return its root.</p>
      </Problem>

      <Problem
        n={6}
        title="Same tree"
        level="Easy"
        examples={[
          { input: "p = [1, 2, 3], q = [1, 2, 3]", output: "true", why: "Same shape, same values." },
          { input: "p = [1, 2], q = [1, null, 2]", output: "false", why: "The same values, but 2 is a left child in p and a right child in q." },
          { input: "p = [1, 2, 1], q = [1, 1, 2]", output: "false", why: "Same shape, but the values differ in the children." },
        ]}
        hints={[
          <>Compare two nodes at a time, one from each tree, walking in step.</>,
          <>There are three cases for a pair: both null, exactly one null, neither null.</>,
        ]}
        approaches={[
          {
            name: "Serialise both and compare (brute force)",
            idea: <p>Turn each tree into a string in preorder, writing a marker for every missing child so the shape is captured. Equal strings mean equal trees.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function serialize(node) {
  if (node === null) return "#";
  return node.val + "," + serialize(node.left) + "," + serialize(node.right);
}

function isSameTree(p, q) {
  return serialize(p) === serialize(q);
}

console.log(isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])));       // true
console.log(isSameTree(buildTree([1, 2]), buildTree([1, null, 2])));       // false
console.log(isSameTree(buildTree([1, 2, 1]), buildTree([1, 1, 2])));       // false`,
            explain: <p>O(n) time and extra space for the strings. Without the <code>#</code> markers, <code>[1,2]</code> and <code>[1,null,2]</code> would look alike, which is why markers are essential. Correct but wasteful: it builds both strings even if the roots differ.</p>,
          },
          {
            name: "Recursion in step",
            idea: (
              <ol>
                <li>Both null: the same.</li>
                <li>Only one null: different.</li>
                <li>Otherwise the values must be equal and both pairs of children must be the same.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSameTree(p, q) {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

console.log(isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])));       // true
console.log(isSameTree(buildTree([1, 2]), buildTree([1, null, 2])));       // false
console.log(isSameTree(buildTree([1, 2, 1]), buildTree([1, 1, 2])));       // false`,
            explain: <p>O(n) time, O(h) space, and it stops at the first difference because <code>&amp;&amp;</code> short-circuits.</p>,
          },
          {
            name: "Explicit stack of pairs",
            idea: <p>Push the pair of roots. Pop a pair, run the same three checks, then push the left pair and the right pair.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSameTree(p, q) {
  const stack = [[p, q]];
  while (stack.length > 0) {
    const [a, b] = stack.pop();
    if (a === null && b === null) continue;
    if (a === null || b === null || a.val !== b.val) return false;
    stack.push([a.left, b.left], [a.right, b.right]);
  }
  return true;
}

console.log(isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])));       // true
console.log(isSameTree(buildTree([1, 2]), buildTree([1, null, 2])));       // false
console.log(isSameTree(buildTree([1, 2, 1]), buildTree([1, 1, 2])));       // false`,
            explain: <p>The same logic with an explicit stack: O(n) time, O(h) space.</p>,
          },
        ]}
        compare={<p>The recursion; it is the clearest. (LeetCode 100.) The same pair-walking idea returns in lesson 43 for symmetric trees and subtrees.</p>}
      >
        <p>Given the roots of two binary trees <code>p</code> and <code>q</code>, return whether they are the same: identical shape and identical values.</p>
      </Problem>

      <Problem
        n={7}
        title="Leaf-similar trees"
        level="Easy"
        examples={[
          { input: "root1 = [3, 5, 1, 6, 2, 9, 8, null, null, 7, 4], root2 = [3, 5, 1, 6, 7, 4, 2, null, null, null, null, null, null, 9, 8]", output: "true", why: "Both leaf sequences, left to right, are 6, 7, 4, 9, 8 even though the trees have different shapes." },
          { input: "root1 = [1, 2, 3], root2 = [1, 3, 2]", output: "false", why: "The leaf sequences are 2, 3 and 3, 2: order matters." },
        ]}
        hints={[
          <>A <em>leaf</em> is a node with no children. In which traversal order do you meet leaves left to right?</>,
          <>Any depth-first order meets leaves in left-to-right order, as long as the left subtree is explored before the right one.</>,
        ]}
        approaches={[
          {
            name: "Collect both leaf lists, then compare",
            idea: <p>Walk each tree and push the value of every leaf into an array. Compare the arrays element by element.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function leaves(node, out = []) {
  if (node === null) return out;
  if (node.left === null && node.right === null) out.push(node.val);
  leaves(node.left, out);
  leaves(node.right, out);
  return out;
}

function leafSimilar(root1, root2) {
  const a = leaves(root1), b = leaves(root2);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

console.log(leafSimilar(
  buildTree([3, 5, 1, 6, 2, 9, 8, null, null, 7, 4]),
  buildTree([3, 5, 1, 6, 7, 4, 2, null, null, null, null, null, null, 9, 8]),
)); // true
console.log(leafSimilar(buildTree([1, 2, 3]), buildTree([1, 3, 2]))); // false`,
            explain: <p>O(n + m) time and space for the two lists.</p>,
          },
          {
            name: "Pull leaves lazily, one at a time",
            idea: <p>Give each tree its own stack and a helper that returns its next leaf using the iterative preorder from this lesson. Compare the leaves as they come and stop at the first mismatch.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function nextLeaf(stack) {
  while (stack.length > 0) {
    const node = stack.pop();
    if (node.left === null && node.right === null) return node.val;
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return undefined;                       // no more leaves
}

function leafSimilar(root1, root2) {
  const s1 = root1 ? [root1] : [];
  const s2 = root2 ? [root2] : [];
  while (true) {
    const a = nextLeaf(s1), b = nextLeaf(s2);
    if (a !== b) return false;
    if (a === undefined) return true;     // both ran out together
  }
}

console.log(leafSimilar(
  buildTree([3, 5, 1, 6, 2, 9, 8, null, null, 7, 4]),
  buildTree([3, 5, 1, 6, 7, 4, 2, null, null, null, null, null, null, 9, 8]),
)); // true
console.log(leafSimilar(buildTree([1, 2, 3]), buildTree([1, 3, 2]))); // false`,
            explain: <p>O(n + m) time in the worst case, but it can stop early, and extra space is only the two stacks (O(h)) rather than two full lists.</p>,
          },
        ]}
        compare={<p>Collecting the lists is simpler and fine for interviews; mention the lazy version as an optimisation. (LeetCode 872.)</p>}
      >
        <p>The <em>leaf value sequence</em> of a tree is its leaf values read from left to right. Two trees are leaf-similar if their sequences are equal. Return whether <code>root1</code> and <code>root2</code> are leaf-similar.</p>
      </Problem>
    </>
  );
}
