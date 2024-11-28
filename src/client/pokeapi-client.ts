import { gql } from "@/__generated__";
import { type Pokemon } from "@/types/pokemon-types";
import { HttpLink, InMemoryCache, ApolloClient } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: "https://beta.pokeapi.co/graphql/v1beta",
    }),
  });
});

export async function getPokemonData(pokemon: string[]): Promise<Record<string, Pokemon>> {
  const { data } = await query({
    query: gql(`
      query pokemonQuery($pokemon: [String!]) {
        pokemon: pokemon_v2_pokemon(where: { name: { _in: $pokemon } }) {
          name
          species: pokemon_v2_pokemonspecy {
            names: pokemon_v2_pokemonspeciesnames(
              where: { pokemon_v2_language: { name: { _eq: "en" } } }
            ) {
              name
            }
          }
          types: pokemon_v2_pokemontypes {
            type: pokemon_v2_type {
              name
            }
          }
          sprites: pokemon_v2_pokemonsprites {
            default: sprites(path: "front_default")
          }
          cries: pokemon_v2_pokemoncries {
            cry: cries(path: "latest")
          }
        }
      }
    `),
    variables: {
      pokemon,
    },
  });

  return Object.fromEntries(
    data.pokemon.map((pokemon) => [
      pokemon.name,
      {
        id: pokemon.name,
        name: pokemon.species!.names[0]!.name,
        types: pokemon.types.map((type) => type.type!.name),
        sprite: pokemon.sprites[0]?.default as string,
        cry: pokemon.cries[0]?.cry as string,
      },
    ])
  );
}
