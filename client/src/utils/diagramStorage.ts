interface Diagram {
  nodes: any[];
  edges: any[];
  name: string;
}

export function saveDiagram(diagram: Diagram): void {
  localStorage.setItem(
    `diagram-${diagram.name}`, 
    JSON.stringify(diagram)
  );
}

export function loadDiagram(name: string): Diagram | null {
  const data = localStorage.getItem(`diagram-${name}`);
  return data ? JSON.parse(data) : null;
}

export function listDiagrams(): string[] {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('diagram-'))
    .map(key => key.replace('diagram-', ''));
}

export function deleteDiagram(name: string): void {
  localStorage.removeItem(`diagram-${name}`);
}
