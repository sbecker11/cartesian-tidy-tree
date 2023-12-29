import * as d3 from "d3";

interface NodeData {
  name: string;
  children?: NodeData[];
}

export function setupD3(container: HTMLElement) {
  const width = 928;

  async function fetch_json(filepath: string) {
    let response = (await d3.json(filepath) as NodeData);
    console.log({ response });
    render_data(response);
  }

  fetch_json("./flare.json");

  function render_data(data: NodeData) {
    const root = d3.hierarchy(data);
    const dx = 10;
    const dy = width / (root.height + 1);

    const tree = d3.tree<NodeData>().nodeSize([dx, dy]);

    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);

    let x0 = Infinity;
    let x1 = -x0;
    tree(root).each((d: d3.HierarchyPointNode<NodeData>) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const height = x1 - x0 + dx * 2;

    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(root.links())
      .join("path")
      .attr("d", (d) => {
        const linkGenerator = d3
          .linkHorizontal<d3.HierarchyPointLink<NodeData>, [number, number]>()
          .source((d) => [d.source.y, d.source.x])
          .target((d) => [d.target.y, d.target.x]);
        return linkGenerator(d as d3.HierarchyPointLink<NodeData>);
      });

    const node = svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll()
      .data(tree(root).descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 2.5);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .clone(true).lower()
      .attr("stroke", "white");

    container.append(svg.node()!);
  }
}
