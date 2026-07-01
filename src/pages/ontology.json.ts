import type { APIRoute } from 'astro';
import { RELATION_LABELS, RELATION_DESCRIPTION, MANUAL_ONLY_RELATIONS } from '../lib/content/schemas/relations';

export const prerender = true;

export const GET: APIRoute = async () => {
  const terms = Object.keys(RELATION_LABELS).map((key) => {
    const type = key as any;
    return {
      "@type": "DefinedTerm",
      "name": key,
      "label": RELATION_LABELS[type],
      "description": RELATION_DESCRIPTION[type],
      "x-inferencePolicy": MANUAL_ONLY_RELATIONS.includes(type) ? "Manual only" : "Safe to infer from content/tag overlap",
      "x-directionality": "source -> target (directional edge expressing relationship from source to target)"
    };
  });

  const registry = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Hillary Njuguna — Ontology Edge Registry",
    "description": "Definition of edge semantics, directionality, and inference rules for the corpus graph.",
    "hasDefinedTerm": terms
  };

  return new Response(JSON.stringify(registry, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
