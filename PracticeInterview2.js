let Graph = function() {
	this.adj = {}
	this.parent = {}
	this.discovered = new Set()
	this.order = []
}

Graph.prototype.topologicalOrder = function() {
	return this.order.reverse()
}

function alphabeticalOrdering(words) {
	let graph = new Graph()

	if(words.length === 0) {
		throw new Error('Word list cannot be empty')
	}

	if(words.length === 1) {
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

		let i1 = 0, i2 = 0
		while(chars1[i1] === chars2[i2]) {
			if(i1 === chars1.length-1 || i2 === chars2.length-1) {
				break
			}
			i1++
			i2++
		}

		if(!graph.adj[chars1[i1]]) {
			graph.adj[chars1[i1]] = []
			graph.adj[chars1[i1]].push(chars2[i2])
		} else {
			graph.adj[chars1[i1]].push(chars2[i2])
		}
	}

	// topological sort
	for(let node of Object.keys(graph.adj)) {
		if(!graph.discovered.has(node)) {
			dfs(graph, node)
		}
	}
	
	return graph.topologicalOrder()
}

function dfs(graph, node) {

	graph.discovered.add(node)

	if(!graph.adj[node]) {
		graph.order.push(node)
		return
	}

	for(let adj of graph.adj[node]) {
		if(!graph.discovered.has(adj)) {
			dfs(graph, adj)
		}
	}

	graph.order.push(node)
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

words = ['aaaaaa']
expected = ['d', 'a', 'b', 'c', 'z']
const test = () => alphabeticalOrdering(words)
assertThrowsError(test, 'Test multiple characters => insufficient data (single word)')

words = ['zbcd', 'zbca', 'zbcb', 'zbcc', 'zbca']
expected = ['d', 'a', 'b', 'c']
assertEqual(alphabeticalOrdering(words), expected, 'Test ordering cycle present')

words = ['a', 'b', 'by']
expected = ['a', 'b']
assertEqual(alphabeticalOrdering(words), expected, 'Test ordering invalid input (ambiguous extra character)')

words = ['a', 'b', 'by', 'bv', 'ca', 'cy', 'cz', 'cr']
expected = ['a', 'y', 'z', 'r', 'v', 'b', 'c']
assertEqual(alphabeticalOrdering(words), expected, 'Test ordering invalid input (ambiguous extra character)')

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