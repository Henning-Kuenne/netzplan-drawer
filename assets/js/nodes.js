// Disable text selecting inside nodes div
$("#nodes").disableSelection();

function clearNodes() {
  // Clear nodes
  $("#nodes").empty();
  // Clear input
  //$("#node-instructions").val("");
}

function getNodeFromId(nodes, id) {
  // flatten list
  let flattenedNodes = [].concat.apply([], nodes);
  // filter out the id we want
  return flattenedNodes.filter(node => node.id == id)[0];
}

function createNodes() {
  let nodeData = [];

  let instructionText = $("#node-instructions").val();
  instructionText.split("\n").forEach((line, index) => {
    if (line.length <= 3) {
      return
    }

    values = line.split("|");

    node = {
      id: index+1,
      s_id: (index+1).toString(),
      description: values[0],
      predecessors: $.map(values[1].split(","), Number),
      successors: $.map(values[2].split(","), Number),
      time: parseFloat(values[3])
    }

    nodeData.push(node);
  })

  // Sort nodes
  allowedPredecessors = [0];
  let nodeDataCopy = [...nodeData];
  let sortedNodes = [];

  while (nodeDataCopy.length > 0) {
    let matchingNodes = nodeDataCopy.filter(node => node.predecessors.every(predecessor => allowedPredecessors.includes(predecessor)));
    sortedNodes.push(matchingNodes);
  
    // Update IDs of already sorted nodes
    matchingNodes.forEach(node => allowedPredecessors.push(node.id));

    // Filter out the nodes that were just matched
    nodeDataCopy = nodeDataCopy.filter(node => !(allowedPredecessors.includes(node.id)));
  }

  /*
  Calculations
  */

  // Calculate FAZ, FEZ
  sortedNodes.forEach((nodeColumn, nodeColumnIndex) => {
    // All nodes in column 0 have FAZ of 0 and FEZ of their time
    if (nodeColumnIndex == 0) {
      nodeColumn.forEach(node => {
        node.faz = 0;
        node.fez = node.time;
      })
    } else {
      nodeColumn.forEach(node => {
        // get the highest FEZ of predecessors nodes
        let previousNodes = [];
        let highestFEZ = -Infinity;
        node.predecessors.forEach(predecessor => previousNodes.push(getNodeFromId(sortedNodes, predecessor)))

        previousNodes.forEach(preNode => {
          if (preNode.fez > highestFEZ) {
            highestFEZ = preNode.fez;
          }
        })

        node.faz = highestFEZ;
        node.fez = node.faz + node.time;
      })
    }
  })

  // Calculate SAZ, SEZ
  sortedNodes.reverse().forEach((nodeColumn, nodeColumnIndex) => {
    // Last (here first) columns SEZ is the same as FEZ
    if (nodeColumnIndex == 0) {
      // get the highest fez of all columns
      highestFEZ = -Infinity;
      nodeColumn.forEach(node => {
        if (node.fez > highestFEZ) {
          highestFEZ = node.fez;
        }
      })

      nodeColumn.forEach(node => {
        node.sez = highestFEZ;
        node.saz = node.sez - node.time;
      })
    } else {
      nodeColumn.forEach(node => {
        // get the lowest SAZ of all successors
        let successorNodes = [];
        let lowestSAZ = Infinity;
        node.successors.forEach(successor => successorNodes.push(getNodeFromId(sortedNodes, successor)));

        successorNodes.forEach(sucNode => {
          if (sucNode.saz < lowestSAZ) {
            lowestSAZ = sucNode.saz;
          }
        });
  
        node.sez = lowestSAZ;
        node.saz = node.sez - node.time;
      })
    }
  })

  // reverse back node list
  sortedNodes.reverse();

  // Calculate puffer (FP, GB)
  sortedNodes.forEach(nodeColumn => {
    nodeColumn.forEach(node => {
      // total puffer (GP)
      node.gp = Math.abs(node.saz - node.faz);

      // free puffer (FP)
      let lowestFAZ = Infinity;
      let successorNodes = [];
      node.successors.forEach(successor => successorNodes.push(getNodeFromId(sortedNodes, successor)));

      try {
        successorNodes.forEach(sucNode => {
          if (sucNode.faz < lowestFAZ) {
            lowestFAZ = sucNode.faz;
          }
        });

        node.fp = Math.abs(lowestFAZ - node.fez);

      } catch (TypeError) {
        // sucNode is undefined = last node which does not have a 
        // successor
        // last node therefore always has a fp of 0
        node.fp = 0;
      }
    })
  })  

  // Create nodes
  let nodes = [].concat.apply([], sortedNodes);
  $("#nodes").loadTemplate("#node-template", nodes);

  // Mark the critical path
  nodes.forEach(node => {
    if (node.gp == 0 && node.fp == 0) {
      node.critical = true;
    } else {
      node.critical = false;
    }
  })

  // link the nodes
  nodes.forEach(node => {
    node.successors.forEach(successor => {
      successorNode = getNodeFromId(nodes, successor);
      let class_ = "connection-line";
      if (successorNode && successorNode.critical && node.critical) {
        class_ = "critical-line";
      }

      $().connections({
        from: `#${node.id.toString()}`,
        to: `#${successor.toString()}`,
        class: class_,
      })
    })
  });

  // Align the nodes
  let width = 200;
  let height = 77;

  let gutterWidth = 50;
  let gutterHeight = 30;

  sortedNodes.forEach((nodeColumn, columnIndex) => {
    nodeColumn.forEach((node, nodeIndex) => {
      $(`#${node.id}`).css({
        top: ((columnIndex * height) + (columnIndex * gutterHeight)) - (columnIndex * height),
        left: (nodeIndex * width) + (nodeIndex * gutterWidth),
      })
    })
  })

  // Make the nodes draggable
  $(".node").draggable({
    //grid: [50, 50],
    containment: "parent"
  });

  // Event loop that runs update function all the time
  $.repeat().add("connection").each($).connections("update").wait(0);
}