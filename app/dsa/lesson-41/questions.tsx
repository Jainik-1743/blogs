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
          { input: "root = [1, null, 2, 3]", output: "[1, 2, 3]", why: "Visit 1, then its left side (nothing), then its right side. The right side is node 2, and its left child 3 comes next." },
          { input: "root = [1, 2, 3, 4, 5]", output: "[1, 2, 4, 5, 3]", why: "Node first, then the whole left side (2, 4, 5), then the right side (3)." },
          { input: "root = []", output: "[]", why: "An empty tree has nothing to visit." },
        ]}
        hints={[
          <>Preorder means &quot;node, left side, right side&quot;. Write the node down <em>before</em> the recursive calls (the calls to the same function).</>,
          <>Without recursion, use a stack (a pile where you add and remove only at the top). Which child must you push first, so that the other one comes out first?</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>If the node is null, stop. Otherwise add its value to the answer, then walk the left side, then the right side.</p>,
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
            explain: <p>O(n) time. O(h) space for the call stack (the pile of open calls), where h is the height of the tree. h can be as big as n for a tree that is one long chain.</p>,
          },
          {
            name: "Explicit stack",
            idea: (
              <ol>
                <li>Start with the root on a stack.</li>
                <li>Pop a node, record it, then push its right child and then its left child.</li>
                <li>The left child is on top, so it is handled next. The whole left side is finished before we touch the right side.</li>
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
            explain: <p>O(n) time. Each level of the tree leaves at most one waiting sibling (the other child of the same parent) on the stack. So the stack holds at most about h + 1 nodes, which is O(h) space. There is no limit on recursion depth to worry about.</p>,
          },
        ]}
        compare={<p>Write the recursive one first. It is only three lines. If the interviewer says &quot;without recursion&quot;, switch to the stack. (LeetCode 144.)</p>}
      >
        <p>Return the preorder traversal (the list of node values in preorder) of a binary tree.</p>
      </Problem>

      <Problem
        n={2}
        title="Binary tree inorder traversal"
        level="Easy"
        examples={[
          { input: "root = [1, null, 2, 3]", output: "[1, 3, 2]", why: "1 has no left side, so it comes first. Then the left side of 2 (just 3), then 2 itself." },
          { input: "root = [1, 2, 3, 4, 5]", output: "[4, 2, 5, 1, 3]", why: "Left side (4, 2, 5), then the root 1, then the right side (3)." },
        ]}
        hints={[
          <>Inorder means &quot;left side, node, right side&quot;. Record the node <em>between</em> the two recursive calls.</>,
          <>Without recursion: go left and push each node. When you cannot go further left, pop a node, record it, and move to its right child.</>,
          <>For O(1) extra space there is a clever trick called Morris traversal. It temporarily links the node that comes just before the current node in inorder (its &quot;predecessor&quot;) back to the current node.</>,
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
                <li>When it is null, pop the top of the stack. That is the next node in order. Record it and set <code>cur</code> to its right child.</li>
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
                <li>Otherwise find its <em>predecessor</em>. This is the node that comes just before it in inorder: the rightmost node of its left side.</li>
                <li>If the predecessor&apos;s right link is empty, point it back at the current node (a temporary link, like a thread) and go left.</li>
                <li>If it already points at the current node, we have just finished the left side. Remove the thread, record the current node, and go right.</li>
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
        pred.right = cur;          // temporary link: a way back once the left side is done
        cur = cur.left;
      } else {
        pred.right = null;         // second visit: remove the temporary link
        out.push(cur.val);
        cur = cur.right;
      }
    }
  }
  return out;
}

console.log(inorderTraversal(buildTree([1, null, 2, 3])));  // [1, 3, 2]
console.log(inorderTraversal(buildTree([1, 2, 3, 4, 5]))); // [4, 2, 5, 1, 3]`,
            explain: <p>Still O(n) time (each edge, or link, is walked only a small fixed number of times). But it uses only O(1) extra space, and the tree is back to normal at the end. While it runs, it changes the tree for a short time. So it is not safe if other code reads the tree at the same moment. Know that it exists. Interviews usually expect the stack version.</p>,
          },
        ]}
        compare={<p>Start with recursion. Use the stack version if recursion is not allowed. Mention Morris if they ask for O(1) space. (LeetCode 94.)</p>}
      >
        <p>Return the inorder traversal (the list of node values in inorder) of a binary tree.</p>
      </Problem>

      <Problem
        n={3}
        title="Binary tree postorder traversal"
        level="Easy"
        examples={[
          { input: "root = [1, null, 2, 3]", output: "[3, 2, 1]", why: "Finish the whole side of 2 first (3, then 2), and only then the root 1." },
          { input: "root = [1, 2, 3, 4, 5]", output: "[4, 5, 2, 3, 1]", why: "Both children before their parent, all the way up." },
        ]}
        hints={[
          <>Record the node <em>after</em> both recursive calls.</>,
          <>Postorder (left, right, node) written backwards is (node, right, left). That is preorder with the two children swapped.</>,
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
            idea: <p>Run a stack-based preorder that goes node, then <em>right</em>, then left (push left first). Reverse the output to get left, right, node.</p>,
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
            explain: <p>O(n) time and space. It is simple and hard to get wrong. It records the nodes in the wrong order and fixes the order at the end.</p>,
          },
          {
            name: "One stack, remember the last node visited",
            idea: (
              <ol>
                <li>Go left and push each node, like the stack version of inorder.</li>
                <li>Look at the top node without removing it. If it has a right child we have not handled yet, move to that child.</li>
                <li>Otherwise both sides are done. Record the node, pop it, and remember it in <code>last</code>.</li>
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
            explain: <p>O(n) time, O(h) space, and the output is built in the right order. The <code>last</code> variable tells us that we are coming back from the right child, not arriving for the first time.</p>,
          },
        ]}
        compare={<p>Use recursion by default. For the stack version, the reverse-preorder trick is the easiest to remember when you are nervous. (LeetCode 145.)</p>}
      >
        <p>Return the postorder traversal (the list of node values in postorder) of a binary tree.</p>
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
            idea: <p>The depth of null is 0. The depth of a node is 1 plus the larger depth of its two children.</p>,
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
            explain: <p>O(n) time, O(h) space. Each node asks its children for their answers and then adds itself. This is postorder thinking: children first, then the node.</p>,
          },
          {
            name: "Explicit stack carrying the depth",
            idea: <p>Push <code>[node, depth]</code> pairs. Each time you pop a node, update the best depth seen so far. Then push its children with depth + 1.</p>,
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
            explain: <p>O(n) time. Here the depth travels <em>down</em> with each stack entry, instead of coming back up from the recursion. It also works for very deep trees.</p>,
          },
        ]}
        compare={<p>Use the two-line recursion. (LeetCode 104.) Lesson 42 adds a third way: count the levels with a queue.</p>}
      >
        <p>Return the maximum depth of a binary tree: the number of <em>nodes</em> along the longest path from the root down to a leaf.</p>
      </Problem>

      <Problem
        n={5}
        title="Invert binary tree"
        level="Easy"
        examples={[
          { input: "root = [4, 2, 7, 1, 3, 6, 9]", output: "[4, 7, 2, 9, 6, 3, 1]", why: "At every node the left and right children swap places, so the tree becomes its mirror image (like looking at it in a mirror)." },
          { input: "root = [2, 1, 3]", output: "[2, 3, 1]", why: "Only the root has children to swap." },
          { input: "root = []", output: "[]", why: "Nothing to invert." },
        ]}
        hints={[
          <>What does one node have to do? Swap its two children.</>,
          <>Is it enough to swap at the root only? No. The children must be inverted too.</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: (
              <ol>
                <li>If the node is null, return null.</li>
                <li>Invert the left side and the right side.</li>
                <li>Put the inverted right side on the left, and the inverted left side on the right.</li>
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
            explain: <p>O(n) time, O(h) space. It changes the tree itself (no copy) and returns the same root.</p>,
          },
          {
            name: "Explicit stack",
            idea: <p>Pop a node, swap its children, then push the children that exist. The order does not matter, because every node only needs its own swap.</p>,
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
            explain: <p>O(n) time, O(h) space. Any walking order works, including the queue-based one from the next lesson.</p>,
          },
        ]}
        compare={<p>Use recursion. The code reads just like the definition. (LeetCode 226.)</p>}
      >
        <p>Invert a binary tree (swap the left and right child of every node) and return its root.</p>
      </Problem>

      <Problem
        n={6}
        title="Same tree"
        level="Easy"
        examples={[
          { input: "p = [1, 2, 3], q = [1, 2, 3]", output: "true", why: "Same shape, same values." },
          { input: "p = [1, 2], q = [1, null, 2]", output: "false", why: "The values are the same, but 2 is a left child in p and a right child in q." },
          { input: "p = [1, 2, 1], q = [1, 1, 2]", output: "false", why: "The shape is the same, but the values of the children differ." },
        ]}
        hints={[
          <>Compare two nodes at a time, one from each tree, and walk both trees together.</>,
          <>A pair of nodes has three cases: both are null, exactly one is null, or neither is null.</>,
        ]}
        approaches={[
          {
            name: "Turn both into text and compare (brute force)",
            idea: <p>Turn each tree into a string of text in preorder. Write a marker for every missing child, so the shape is kept too. Equal strings mean equal trees.</p>,
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
            explain: <p>O(n) time and extra space for the strings. Without the <code>#</code> markers, <code>[1,2]</code> and <code>[1,null,2]</code> would look the same, so the markers are a must. The answer is correct but wasteful. It builds both strings even if the roots already differ.</p>,
          },
          {
            name: "Recursion, walking both trees together",
            idea: (
              <ol>
                <li>Both are null: they are the same.</li>
                <li>Only one is null: they are different.</li>
                <li>Otherwise the two values must be equal, and both pairs of children must be the same.</li>
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
            explain: <p>O(n) time, O(h) space. It stops at the first difference, because <code>&amp;&amp;</code> skips the rest as soon as one part is false.</p>,
          },
          {
            name: "Explicit stack of pairs",
            idea: <p>Push the pair of roots. Pop a pair and run the same three checks. Then push the left pair and the right pair.</p>,
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
            explain: <p>The same logic with your own stack: O(n) time, O(h) space.</p>,
          },
        ]}
        compare={<p>Use the recursion. It is the clearest. (LeetCode 100.) The same idea of walking two nodes together comes back in lesson 43 for symmetric trees and subtrees.</p>}
      >
        <p>You get the roots of two binary trees <code>p</code> and <code>q</code>. Return whether they are the same: same shape and same values.</p>
      </Problem>

      <Problem
        n={7}
        title="Leaf-similar trees"
        level="Easy"
        examples={[
          { input: "root1 = [3, 5, 1, 6, 2, 9, 8, null, null, 7, 4], root2 = [3, 5, 1, 6, 7, 4, 2, null, null, null, null, null, null, 9, 8]", output: "true", why: "Both leaf lists, read left to right, are 6, 7, 4, 9, 8, even though the trees have different shapes." },
          { input: "root1 = [1, 2, 3], root2 = [1, 3, 2]", output: "false", why: "The leaf lists are 2, 3 and 3, 2. The order matters." },
        ]}
        hints={[
          <>A <em>leaf</em> is a node with no children. In which walking order do you meet the leaves from left to right?</>,
          <>Any depth-first order meets the leaves from left to right, as long as you explore the left side before the right side.</>,
        ]}
        approaches={[
          {
            name: "Collect both leaf lists, then compare",
            idea: <p>Walk each tree and add the value of every leaf to an array. Then compare the two arrays item by item.</p>,
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
            name: "Get leaves one at a time, only when needed",
            idea: <p>Give each tree its own stack and a helper that returns the next leaf, using the stack-based preorder from this lesson. Compare the leaves as they come. Stop at the first mismatch.</p>,
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
            explain: <p>O(n + m) time in the worst case, but it can stop early. The extra space is only the two stacks (O(h)), not two full lists.</p>,
          },
        ]}
        compare={<p>Collecting the lists is simpler and fine for interviews. Mention the one-leaf-at-a-time version as a way to make it faster. (LeetCode 872.)</p>}
      >
        <p>The <em>leaf value sequence</em> of a tree is the list of its leaf values, read from left to right. Two trees are leaf-similar if their lists are equal. Return whether <code>root1</code> and <code>root2</code> are leaf-similar.</p>
      </Problem>
    </>
  );
}
