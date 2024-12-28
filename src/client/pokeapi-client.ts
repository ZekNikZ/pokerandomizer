import { gql } from "@/__generated__";
import { type PokemonTypeName, type Pokemon } from "@/types/pokemon-types";
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
              id
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

  const result = Object.fromEntries(
    data.pokemon.map((pokemon) => [
      pokemon.name,
      {
        id: pokemon.name,
        name: pokemon.species!.names[0]!.name,
        types: pokemon.types.map((type) => ({
          id: type.type!.id,
          name: type.type!.name as PokemonTypeName,
        })),
        sprite: pokemon.sprites[0]?.default as string,
        cry: pokemon.cries[0]?.cry as string,
      },
    ])
  );

  for (const pokemonId of pokemon) {
    if (!result[pokemonId]) {
      console.warn(`No data found for pokemon ${pokemonId}`);
    }
  }

  return result;
}
