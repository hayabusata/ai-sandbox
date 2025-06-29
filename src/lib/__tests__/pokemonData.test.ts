import { getPokemonStatsList } from '../pokemonData';
import fs from 'fs';
import path from 'path';
import { PokemonStats } from '@/types/pokemon';

// fs.readFileSync をモック
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// dataディレクトリのモックパス (実際には使われないが、path.joinのため)
const mockDataDir = path.join(process.cwd(), 'data');
const mockFilePath = path.join(mockDataDir, 'pokemon_base_stats.csv');

describe('getPokemonStatsList', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    mockedFs.readFileSync.mockReset();
  });

  const validHeader = '図鑑番号,名前,タイプ１,タイプ２,通常特性１,通常特性２,通常特性3,夢特性,HP,こうげき,ぼうぎょ,とくこう,とくぼう,すばやさ,合計';

  test('should parse valid CSV data correctly', async () => {
    const csvData = `${validHeader}\n1,フシギダネ,くさ,どく,しんりょく,,,ようりょくそ,45,49,49,65,65,45,318\n2,フシギソウ,くさ,どく,しんりょく,,,ようりょくそ,60,62,63,80,80,60,405`;
    mockedFs.readFileSync.mockReturnValue(csvData);

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: '1',
      name: 'フシギダネ',
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
    });
    expect(result[1]).toEqual({
      id: '2',
      name: 'フシギソウ',
      hp: 60,
      attack: 62,
      defense: 63,
      specialAttack: 80,
      specialDefense: 80,
      speed: 60,
    });
  });

  test('should handle Pokemon with no ID (e.g., Mega Evolutions) by using name as ID', async () => {
    const csvData = `${validHeader}\n,メガフシギバナ,くさ,どく,あついしぼう,,,,80,100,123,122,120,80,625`;
    mockedFs.readFileSync.mockReturnValue(csvData);

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'メガフシギバナ', // Name used as ID
      name: 'メガフシギバナ',
      hp: 80,
      attack: 100,
      defense: 123,
      specialAttack: 122,
      specialDefense: 120,
      speed: 80,
    });
  });

  test('should parse stats as 0 if they are invalid or empty', async () => {
    const csvData = `${validHeader}\n4,ヒトカゲ,ほのお,,もうか,,,サンパワー,39,52,43,ABC,50,65,309\n5,リザード,ほのお,,もうか,,,サンパワー,58,,58,80,65,,405`;
    mockedFs.readFileSync.mockReturnValue(csvData);

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(2);
    expect(result[0].specialAttack).toBe(0); // ABC -> 0
    expect(result[0].speed).toBe(65); // Valid
    expect(result[1].attack).toBe(0);      // Empty -> 0
    expect(result[1].speed).toBe(0);        // Empty -> 0
  });

  test('should skip empty lines', async () => {
    const csvData = `${validHeader}\n1,フシギダネ,くさ,どく,しんりょく,,,ようりょくそ,45,49,49,65,65,45,318\n\n2,フシギソウ,くさ,どく,しんりょく,,,ようりょくそ,60,62,63,80,80,60,405`;
    mockedFs.readFileSync.mockReturnValue(csvData);

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(2);
  });

  test('should skip rows with insufficient columns after header', async () => {
    const csvData = `${validHeader}\n1,フシギダネ,くさ,どく,しんりょく,,,ようりょくそ,45,49,49,65,65,45,318\ninvalid,row\n2,フシギソウ,くさ,どく,しんりょく,,,ようりょくそ,60,62,63,80,80,60,405`;
    mockedFs.readFileSync.mockReturnValue(csvData);

    // console.warnの出力を監視 (任意)
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(2); // invalid,row はスキップされる
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping row 2 due to insufficient columns'));
    consoleWarnSpy.mockRestore();
  });

  test('should skip rows with empty name', async () => {
    const csvData = `${validHeader}\n1,,くさ,どく,しんりょく,,,ようりょくそ,45,49,49,65,65,45,318\n2,フシギソウ,くさ,どく,しんりょく,,,ようりょくそ,60,62,63,80,80,60,405`;
    mockedFs.readFileSync.mockReturnValue(csvData);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('フシギソウ');
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping row 1 because name is empty'));
    consoleWarnSpy.mockRestore();
  });


  test('should return an empty array for a CSV with only a header', async () => {
    const csvData = `${validHeader}`;
    mockedFs.readFileSync.mockReturnValue(csvData);

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(0);
  });

  test('should return an empty array for an empty CSV file (after header if any)', async () => {
    // PapaParseの挙動として、入力が空文字列だと results.data が `[[]]` のようになることがある。
    // skipEmptyLines: true なので、実質的にデータなしとして扱われる。
    const csvData = ``; // ヘッダーすらない、またはヘッダー後が完全に空
    mockedFs.readFileSync.mockReturnValue(csvData);
    // getPokemonStatsList内でヘッダー行がないとエラーになるので、ヘッダーは最低限渡す
    // ただし、ヘッダーのみのケースは上のテストでカバー。ここではデータ行が全くないケースを想定。
    // より正確には、ヘッダー行の後に何も有効な行がない場合。
    // しかし、現在の実装ではヘッダーがないとエラーになる。

    // ヘッダーはあるがデータ行が全くない場合
    const csvDataWithHeaderOnly = `${validHeader}\n`;
    mockedFs.readFileSync.mockReturnValue(csvDataWithHeaderOnly);
    let result = await getPokemonStatsList();
    expect(result).toHaveLength(0);

    // ファイル自体が本当に空の場合 (ヘッダー行もない)
    // これは current implementation では Papa.parse より前の段階で header[0] でエラーになる可能性がある。
    // Papa.parse に空文字列を渡すと、`results.data` は `[[]]` となり、`data.length < 2` (ヘッダーとデータ行) の条件でエラーになる
    mockedFs.readFileSync.mockReturnValue('');
    await expect(getPokemonStatsList()).rejects.toThrow('CSV data is insufficient.');
  });


  test('should throw error if required headers are missing', async () => {
    const csvData = `図鑑番号,名前,HP,こうげき,ぼうぎょ\n1,TestMon,10,10,10`; // とくこう、とくぼう、すばやさ が欠損
    mockedFs.readFileSync.mockReturnValue(csvData);

    await expect(getPokemonStatsList()).rejects.toThrow('One or more required CSV headers are missing.');
  });

  test('should throw error if CSV file content is insufficient (e.g. less than 2 lines)', async () => {
    // このテストは、ヘッダー行のみのケースとは少し異なる。
    // 例えば、ヘッダー行に見えるが、それがデータとして不十分な場合。
    // 現在の実装では、`data.length < 2` (ヘッダー + 最低1データ行を期待しているわけではないが、ヘッダー行がないとダメ)
    // ヘッダー行自体がない、またはヘッダー行と認識できるものがない場合。
    const csvData = `図鑑番号,名前`; // これがヘッダーとみなされても、データ行がない
                                 // かつ、必須ヘッダーも足りない
    mockedFs.readFileSync.mockReturnValue(csvData);
    // このケースでは "CSV data is insufficient." の前に "headers are missing" が先に評価される
    await expect(getPokemonStatsList()).rejects.toThrow('One or more required CSV headers are missing.');

    // ヘッダー行を模倣するが、データ行がない場合（これは 'should return an empty array for a CSV with only a header' でカバー）
    // `data.length < 2` のチェックは、パース結果の `results.data` の行数に対するもの。
    // ヘッダー行と、その後に続くデータ行がないと、実質的なデータがないとみなす。
    // しかし、papaparseはヘッダー行も data 配列の要素として返すので、
    // ヘッダー行のみの場合、`results.data` の length は 1。
    // `data.length < 2` (現在の実装) は、ヘッダー行 + 1行以上のデータがないとエラー、という意味ではなく、
    // `results.data` (ヘッダー含む) が1行以下ならエラー。
    // なので、ヘッダー行のみの場合は `results.data.length` は 1 となり、`data.length < 2` が true になってエラーになる。
    // これは 'should return an empty array for a CSV with only a header' の期待値と矛盾する。
    // 修正：ヘッダーのみの場合はエラーではなく空配列を期待する。
    // `getPokemonStatsList` の `data.length < 2` のチェックを `data.length < 1` (ヘッダー行すらない) にするか、
    // またはヘッダー行のみの場合は正常に空配列を返すようにロジック修正が必要。
    // 現状の実装(data.length < 2でエラー)に基づくと、以下のテストはエラーを期待する。
    mockedFs.readFileSync.mockReturnValue(validHeader); // ヘッダー行のみ
    // ↓ この期待は `should return an empty array for a CSV with only a header` と矛盾。
    // await expect(getPokemonStatsList()).rejects.toThrow('CSV data is insufficient.');
    // pokemonData.ts の `if (data.length < 2)` を `if (data.length === 0)` や `if (!data[0])` に変更するか、
    // ヘッダー行のみの場合を許容するように変更する必要がある。
    // 今回は、ヘッダー行のみの場合は空のポケモンリストを返すのが自然なので、そのようにテストを修正。
    // `getPokemonStatsList` の修正により、ヘッダー行のみの場合はエラーではなく空配列が返る。
    // ファイル自体が本当に空（ヘッダーすらない）場合はエラーを期待する。
    mockedFs.readFileSync.mockReturnValue(''); // ヘッダーすらない空のファイル
    await expect(getPokemonStatsList()).rejects.toThrow('CSV data is empty or header is malformed.');

    // ヘッダー行はあるが、それが空のセルのみで構成されている場合もエラー
    mockedFs.readFileSync.mockReturnValue(',,,');
    await expect(getPokemonStatsList()).rejects.toThrow('CSV data is empty or header is malformed.');
  });

  test('should handle BOM in header and parse correctly', async () => {
    // pokemonData.ts で header[0] = header[0].replace(/^\uFEFF/, '') を追加したので、BOMがあっても正しくパースされるはず
    const csvDataWithBOM = `\uFEFF${validHeader}\n1,フシギダネ,くさ,どく,しんりょく,,,ようりょくそ,45,49,49,65,65,45,318`;
    mockedFs.readFileSync.mockReturnValue(csvDataWithBOM);

    // pokemonData.ts のヘッダー取得部分でBOMが除去されていないと、indexOf が -1 になり
    // "One or more required CSV headers are missing" エラーになるはず。
    // BOM除去が実装されていれば、正常にパースされる。
    // 現在の実装ではBOM除去は明示的に行われていない。
    // PapaParse自体がBOMを処理してくれるか、あるいはヘッダー名が "\uFEFF図鑑番号" のようになる。
    // PapaParseのドキュメントによると、BOMは自動的に処理されることが多い。
    // 実際にテストして確認する。もし失敗すれば、pokemonData.ts側でBOM除去の処理を追加する。

    const result = await getPokemonStatsList();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('フシギダネ');

    // もしBOMが原因でヘッダーが見つからない場合のエラーをテストするには、
    // pokemonData.ts 側のヘッダーチェックが機能することを確認する。
    // 上の 'should throw error if required headers are missing' でカバーされている。
  });

  test('should throw error if file is not found (fs.readFileSync throws)', async () => {
    mockedFs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });
    await expect(getPokemonStatsList()).rejects.toThrow('File not found');
  });
});
