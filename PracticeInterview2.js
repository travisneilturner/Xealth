let Graph = function() {
  this.adj = {}
  this.discovered = new Set()
  this.parent = {}
  this.processed = new Set()
  this.topologicalOrder = []
  this.vertices = new Set()
}

Graph.prototype.classifyEdge = function(source, dest) {
  if (this.parent[dest] === source) {
    return 'TREE'
  } else if(this.discovered.has(dest) && !this.processed.has(dest)) {
    return 'BACK'
  } else {
    return 'CROSS|FORWARD'
  }
}

Graph.prototype.findPath = function(path, start, end) {
  if (start === end || !this.parent[end]) {
    path.push(start)
    return path
  } else {
    path.push(end)
    return this.findPath(path, start, this.parent[end])
  }
}

Graph.prototype.isOrderableOver = function(chars) {
  let nodes = new Set()

  for (let c of chars) {
    if (!this.vertices.has(c)) {
      return false
    }
  }

  this.vertices.forEach((v) => {
    nodes.add(v)
  })

  // remove all nodes with incoming edges
  Object.keys(this.adj).forEach((source) => {
    for (let dest of this.adj[source]) {
      nodes.delete(dest) // dest has an incoming edge
    }
  })

  // Test to make sure remaining nodes with no incoming edges have outgoing edges
  nodes.forEach((node) => {
    if (this.adj[node].length === 0) {
      return false
    }
  })

  if (nodes.size > 1) {
    return false
  }

  return true
} 

function alphabeticalOrdering(words) {
  let graph = new Graph()
  let chars = new Set()

	if (words.length === 0) {
		throw new Error('Word list cannot be empty')
	}

	if (words.length === 1) {
		if (words[0].length != 1) {
			throw new Error('Single word input with multiple characters -- insufficient information to provide alphabet')
		} else {
			return [words[0].charAt(0)]
		}
  }

	// discover edges in graph
	for (let i = 0; i < words.length-1;  i++) {
		let chars1 = words[i].split('')
    let chars2 = words[i+1].split('')
    
    chars1.forEach((char) => {
      if(!chars.has(char)) {
        chars.add(char)
      }
    })

    chars2.forEach((char) => {
      if(!chars.has(char)) {
        chars.add(char)
      }
    })

		let i1 = 0, i2 = 0
		while (chars1[i1] === chars2[i2]) {
			if (i1 === chars1.length-1 || i2 === chars2.length-1) {
				break
			}
			i1++
			i2++
    }
    
    if (chars1[i1] != chars2[i2]) {
      if (!graph.adj[chars1[i1]]) {
        graph.vertices.add(chars1[i1])
        graph.adj[chars1[i1]] = []
      }
      if (!graph.vertices.has(chars2[i2])) {
        graph.vertices.add(chars2[i2])
      }
			graph.adj[chars1[i1]].push(chars2[i2])
		}
  }

  if (Object.keys(graph.adj).length === 0) {
    throw new Error('Invalid input -- character set cardinality of 1')
  }

  if (!graph.isOrderableOver(chars)) {
    throw new Error('Input data is not orderable')
  }

	// topological sort
	for (let node of Object.keys(graph.adj)) {
		if (!graph.discovered.has(node)) {
			dfs(graph, node)
		}
	}
	
	return graph.topologicalOrder.reverse()
}

function processEdge(graph, source, dest) {
  let edgeCategory = graph.classifyEdge(source, dest)
  if (edgeCategory === 'BACK') {
    console.log('[WARN] Back edge detected, data set contains cycle: ', [dest, ...graph.findPath([], dest, source)].reverse().join(','))
  }
}

function dfs(graph, node) {
	graph.discovered.add(node)

	if (!graph.adj[node]) {
		graph.topologicalOrder.push(node)
		return
	}

	for (let adj of graph.adj[node]) {
		if (!graph.discovered.has(adj)) {
      graph.parent[adj] = node
      processEdge(graph, node, adj)
			dfs(graph, adj)
		} else {
      processEdge(graph, node, adj)
    } 
	}

  graph.processed.add(node)
	graph.topologicalOrder.push(node)
}


let words = ['zbcd', 'zbdc', 'bbzz', 'czbb', 'dddd']
let expected = ['z', 'b', 'c', 'd']
assertEqual(alphabeticalOrdering(words), expected, 'Test basic ordering')

words = ['zbcd', 'zbca', 'zbcb', 'zbcc', 'zbcz']
expected = ['d', 'a', 'b', 'c', 'z']
assertEqual(alphabeticalOrdering(words), expected, 'Test basic ordering one character difference')

words = ['a']
expected = ['a']
assertEqual(alphabeticalOrdering(words), expected, 'Test one character')

words = []
expected = ['a']
let test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test empty input')

words = ['a', 'a', 'a']
expected = ['a']
test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test one repeated character')

words = ['a', 'b', 'c']
expected = ['a', 'b', 'c']
assertEqual(alphabeticalOrdering(words), expected, 'Test one character sequence')

words = ['aaaaaa']
test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test multiple characters => insufficient data (single word)')

words = ['zbcd', 'zbca', 'zbcb', 'zbcc', 'zbca', 'zbci']
test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test input not orderable 1')

words = ['ac', 'bc', 'bd']
test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test input not orderable 2')

words = ['abc', 'ac', 'acb']
test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test input not orderable 3')

words = ['a', 'b', 'by']
test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test input not orderable 4 (ambiguous extra character)')

words = ['a', 'b', 'by', 'bv', 'ca', 'cy', 'cz', 'cr']
expected = ['a', 'y', 'z', 'r', 'v', 'b', 'c']
assertEqual(alphabeticalOrdering(words), expected, 'Test input is orderable but has non-total order')

function assertEqual(a, b, desc) {
  if (JSON.stringify(a) === JSON.stringify(b)) {
    console.log(`${desc} ... PASS`);
  } else {
    console.log(`${desc} ... FAIL: ${a} != ${b}`);
  }
}

function assertThrowsError(func, desc) {
  try {
    func();
    console.log(`${desc} ... FAIL`);
  } catch (e) {
    console.log(`${desc} ... PASS`);
  }
}