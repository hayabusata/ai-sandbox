import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { PokemonStats } from '@/types/pokemon';

// dataディレクトリの絶対パスを取得
const dataDir = path.join(process.cwd(), 'data');

export async function getPokemonStatsList(): Promise<PokemonStats[]> {
  const filePath = path.join(dataDir, 'pokemon_base_stats.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(fileContent, {
      header: false, // ヘッダー行を自分でスキップし、手動でマッピングするためfalse
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        if (data.length < 2) { // ヘッダー行とデータ行が最低でも必要
          return reject(new Error('CSV data is insufficient.'));
        }

        const header = data[0]; // 実際のヘッダー行
        const pokemonList: PokemonStats[] = [];

        // ヘッダーのインデックスを特定（日本語ヘッダー名を想定）
        const idIndex = header.indexOf('図鑑番号');
        const nameIndex = header.indexOf('名前');
        const hpIndex = header.indexOf('HP');
        const attackIndex = header.indexOf('こうげき');
        const defenseIndex = header.indexOf('ぼうぎょ');
        const specialAttackIndex = header.indexOf('とくこう');
        const specialDefenseIndex = header.indexOf('とくぼう');
        const speedIndex = header.indexOf('すばやさ');

        // 必須ヘッダーが存在するか確認
        if ([idIndex, nameIndex, hpIndex, attackIndex, defenseIndex, specialAttackIndex, specialDefenseIndex, speedIndex].some(index => index === -1)) {
          console.error('CSV Header:', header);
          return reject(new Error('One or more required CSV headers are missing. Expected: 図鑑番号, 名前, HP, こうげき, ぼうぎょ, とくこう, とくぼう, すばやさ'));
        }

        // 最初の行（ヘッダー）をスキップしてデータを処理
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          // 行の列数がヘッダーの列数より少ない場合はスキップ
          if (row.length < header.length) {
            console.warn(`Skipping row ${i + 1} due to insufficient columns: ${row}`);
            continue;
          }

          // 「メガシンカ」や「リージョンフォーム」など、図鑑番号がないポケモンもいるため、
          // 図鑑番号がない場合は名前で代替するか、特定のIDを振るなどの対応が必要だが、
          // 今回は図鑑番号がない場合はスキップせず、そのままnameをidとして使うか、
          // もしくは何らかのユニークな値を生成する。
          // ここでは、元々の '図鑑番号' 列をそのまま使うが、空の場合があることに留意。
          // 実際には、図鑑番号がないポケモン（例：メガフシギバナ）の場合、図鑑番号列は空。
          // ユーザーの指示では「全部のポケモンの種族値一覧」とあるため、メガシンカ等も表示対象。
          // IDの取り扱いについては、ここではCSVの図鑑番号を優先し、なければ名前を使う。
          let id = row[idIndex]?.trim();
          const name = row[nameIndex]?.trim();

          if (!name) { // 名前がないデータはスキップ
            console.warn(`Skipping row ${i + 1} because name is empty: ${row}`);
            continue;
          }

          if (!id) { // 図鑑番号が空の場合、名前をIDとして使用（あるいは別のユニークID生成戦略）
            id = name; // 簡易的に名前をIDとする
          }


          const hp = parseInt(row[hpIndex]?.trim(), 10) || 0;
          const attack = parseInt(row[attackIndex]?.trim(), 10) || 0;
          const defense = parseInt(row[defenseIndex]?.trim(), 10) || 0;
          const specialAttack = parseInt(row[specialAttackIndex]?.trim(), 10) || 0;
          const specialDefense = parseInt(row[specialDefenseIndex]?.trim(), 10) || 0;
          const speed = parseInt(row[speedIndex]?.trim(), 10) || 0;

          pokemonList.push({
            id,
            name,
            hp,
            attack,
            defense,
            specialAttack,
            specialDefense,
            speed,
          });
        }
        resolve(pokemonList);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
