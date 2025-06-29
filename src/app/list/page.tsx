'use client' // For Chakra UI components that use client-side features

import { getPokemonStatsList } from '@/lib/pokemonData';
import { PokemonStats } from '@/types/pokemon';
import Link from 'next/link';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Center,
  Spinner,
  Container,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react'; // For client-side data fetching state

export default function PokemonListPage() {
  const [pokemonStatsList, setPokemonStatsList] = useState<PokemonStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getPokemonStatsList();
        setPokemonStatsList(data);
        setError(null);
      } catch (e: any) {
        console.error("Failed to load Pokemon data:", e);
        setError(e.message || "ポケモンのデータの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container centerContent p={8}>
        <Spinner size="xl" />
        <Heading as="h2" size="lg" mt={4}>読み込み中...</Heading>
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent p={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            エラー
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
        </Alert>
        <Button as={Link} href="/" colorScheme="teal" mt={4}>
          ホームに戻る
        </Button>
      </Container>
    );
  }

  if (!pokemonStatsList || pokemonStatsList.length === 0) {
    return (
      <Container centerContent p={8}>
         <Heading as="h1" size="xl" mb={6} textAlign="center">
          ポケモン種族値一覧
        </Heading>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            情報
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            表示できるポケモンがいません。
          </AlertDescription>
        </Alert>
        <Button as={Link} href="/" colorScheme="teal" mt={4}>
          ホームに戻る
        </Button>
      </Container>
    );
  }

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        ポケモン種族値一覧
      </Heading>
      <TableContainer borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Table variant="striped" colorScheme="teal">
          <Thead bg="teal.500">
            <Tr>
              <Th color="white" textAlign="left" p={4}>図鑑番号</Th>
              <Th color="white" textAlign="left" p={4}>名前</Th>
              <Th color="white" isNumeric p={4}>HP</Th>
              <Th color="white" isNumeric p={4}>こうげき</Th>
              <Th color="white" isNumeric p={4}>ぼうぎょ</Th>
              <Th color="white" isNumeric p={4}>とくこう</Th>
              <Th color="white" isNumeric p={4}>とくぼう</Th>
              <Th color="white" isNumeric p={4}>すばやさ</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pokemonStatsList.map((pokemon) => (
              <Tr key={pokemon.id + pokemon.name}>
                <Td p={4}>{pokemon.id}</Td>
                <Td p={4}>{pokemon.name}</Td>
                <Td isNumeric p={4}>{pokemon.hp}</Td>
                <Td isNumeric p={4}>{pokemon.attack}</Td>
                <Td isNumeric p={4}>{pokemon.defense}</Td>
                <Td isNumeric p={4}>{pokemon.specialAttack}</Td>
                <Td isNumeric p={4}>{pokemon.specialDefense}</Td>
                <Td isNumeric p={4}>{pokemon.speed}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Center mt={6}>
        <Button as={Link} href="/" colorScheme="teal">
          ホームに戻る
        </Button>
      </Center>
    </Box>
  );
}
