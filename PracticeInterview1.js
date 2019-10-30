let input = ["star", "tars", "arts", "rats"]

function perms(A) {
	let perms = []
	for(let i = 0; i < A.length-1; i++) {
		for(let j = i+1; j < A.length; j++) {
			let wordArray = A.split('')
			temp = wordArray[i]
			wordArray[i] = wordArray[j]
			wordArray[j] = temp

			perms.push(wordArray.join(''))
		}
	}
	return perms
}

function groupings(A) {
	let graph = {}

	for(let s of A) {
		graph[s] = perms(s)
	}

	for(let root in graph) {
		graph[root] = graph[root].filter(f => A.find(a => a===f) != undefined)
	}

	console.log(JSON.stringify(graph, null, 2))

	let discovered = {}
	for(let word of A) {
		discovered[word] = false
	}

	let c = 0
	for(let word of A) {
		if(!discovered[word]) {
			c++
			dfs(graph, word, discovered)
		}
	}
	
	return c
}

function dfs(graph, node, discovered) {
	let queue = []
	queue.push(node)
	while(queue.length != 0) {
		let v = queue.pop()
		for(let adj of graph[v]) {
			if(discovered[adj] == false) {
				discovered[adj] = true
				queue.push(adj)
			}
		}
	}
}


console.log(groupings(input))