/** Link vindo dos JSON (`/c/todos?colecao=eco`) separado para `routerLink` + `queryParams`. */
export interface RouterLinkParts {
  path: string;
  query: Record<string, string>;
}

export function toRouterLink(url: string): RouterLinkParts {
  const [path, search = ''] = url.split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(search)) };
}
