import { getPokemonStatsList } from '@/lib/pokemonData';
import { PokemonStats } from '@/types/pokemon';
import Link from 'next/link';
// CSS Modulesのファイルをインポート (存在する場合。なければインラインスタイルやglobals.cssで対応)
// import styles from './list.module.css';

export default async function PokemonListPage() {
  let pokemonStatsList: PokemonStats[] = [];
  let error: string | null = null;

  try {
    pokemonStatsList = await getPokemonStatsList();
  } catch (e: any) {
    console.error("Failed to load Pokemon data:", e);
    error = e.message || "ポケモンのデータの読み込みに失敗しました。";
  }

  if (error) {
    return (
      <main style={{ padding: '20px' }}>
        <h1>エラー</h1>
        <p>{error}</p>
        <Link href="/">ホームに戻る</Link>
      </main>
    );
  }

  if (!pokemonStatsList || pokemonStatsList.length === 0) {
    return (
      <main style={{ padding: '20px' }}>
        <h1>ポケモン種族値一覧</h1>
        <p>表示できるポケモンがいません。</p>
        <Link href="/">ホームに戻る</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>ポケモン種族値一覧</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>図鑑番号</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>名前</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>HP</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>こうげき</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>ぼうぎょ</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>とくこう</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>とくぼう</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>すばやさ</th>
          </tr>
        </thead>
        <tbody>
          {pokemonStatsList.map((pokemon) => (
            <tr key={pokemon.id + pokemon.name} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{pokemon.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{pokemon.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{pokemon.hp}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{pokemon.attack}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{pokemon.defense}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{pokemon.specialAttack}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{pokemon.specialDefense}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>{pokemon.speed}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/">ホームに戻る</Link>
      </div>
    </main>
  );
}
