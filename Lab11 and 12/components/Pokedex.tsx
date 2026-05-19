'use client';

import { useState, useRef } from 'react';
import styles from './Pokedex.module.css';

interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

interface PokemonType {
  type: { name: string };
}

interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: { front_default: string };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
}

const TYPE_COLORS: Record<string, string> = {
  fire: '#FF6B35', water: '#4FC3F7', grass: '#81C784', electric: '#FFD54F',
  psychic: '#F48FB1', ice: '#80DEEA', dragon: '#7E57C2', dark: '#5D4037',
  fairy: '#F8BBD0', normal: '#BDBDBD', fighting: '#EF5350', flying: '#90CAF9',
  poison: '#AB47BC', ground: '#FFCC80', rock: '#A1887F', bug: '#AED581',
  ghost: '#7986CB', steel: '#78909C',
};

const STAT_ABBR: Record<string, string> = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SpA', 'special-defense': 'SpD', speed: 'SPD',
};

export default function Pokedex() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenText, setScreenText] = useState('READY...');
  const [log, setLog] = useState<string[]>([
    'This is a classic recreation of the Game Boy Pokédex interface with a modern twist using real Pokémon data from the PokéAPI.',
    '> Ready to search...',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-6), msg]);

  const search = async () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    setError('');
    setPokemon(null);
    setScreenText('LOADING...');
    addLog(`> Searching for "${q}"...`);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
      if (!res.ok) throw new Error('Pokémon not found');
      const data: PokemonData = await res.json();
      setPokemon(data);
      setScreenText(`#${String(data.id).padStart(3, '0')} ${data.name.toUpperCase()}`);
      addLog(`> Found: ${data.name.toUpperCase()} #${String(data.id).padStart(3, '0')}`);
    } catch {
      setError('NOT FOUND');
      setScreenText('ERROR...');
      addLog(`> Error: Pokémon "${q}" not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search();
  };

  const artwork = pokemon?.sprites?.other?.['official-artwork']?.front_default
    || pokemon?.sprites?.front_default;

  return (
    <div className={styles.page}>
      {/* ── POKÉDEX BODY ── */}
      <div className={styles.pokedex}>

        {/* ─── LEFT PANEL ─── */}
        <div className={styles.leftPanel}>
          {/* Top bar */}
          <div className={styles.topBar}>
            <div className={styles.bigLens} />
            <div className={styles.dots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </div>
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="SEARCH..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className={styles.searchBtn} onClick={search}>Search</button>
          </div>

          {/* Hinge */}
          <div className={styles.hinge} />

          {/* Main screen */}
          <div className={styles.screenWrap}>
            <div className={styles.screenDots}>
              <span /><span />
            </div>
            <div className={styles.screen}>
              {loading && <p className={styles.screenMsg}>LOADING...</p>}
              {error && !loading && <p className={styles.screenMsg}>{error}</p>}
              {!loading && !error && !pokemon && (
                <p className={styles.screenMsg}>{screenText}</p>
              )}
              {pokemon && !loading && (
                <div className={styles.pokemonCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork || ''}
                    alt={pokemon.name}
                    className={styles.sprite}
                  />
                  <div className={styles.cardInfo}>
                    <p className={styles.pokeId}>#{String(pokemon.id).padStart(3, '0')}</p>
                    <p className={styles.pokeName}>{pokemon.name.toUpperCase()}</p>
                    <div className={styles.types}>
                      {pokemon.types.map(t => (
                        <span
                          key={t.type.name}
                          className={styles.typeBadge}
                          style={{ background: TYPE_COLORS[t.type.name] || '#888' }}
                        >
                          {t.type.name.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className={styles.measurements}>
                      <span>HT: {(pokemon.height / 10).toFixed(1)}m</span>
                      <span>WT: {(pokemon.weight / 10).toFixed(1)}kg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Speaker grill */}
            <div className={styles.speaker}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.speakerLine} />)}
            </div>
          </div>

          {/* D-pad + controls */}
          <div className={styles.controls}>
            <div className={styles.circleBtn} />
            <div className={styles.smallBtns}>
              <div className={styles.greenBtn} />
              <div className={styles.orangeBtn} />
            </div>
            <div className={styles.dpad}>
              <div className={`${styles.dpadRow} ${styles.dpadTop}`} />
              <div className={styles.dpadMiddle}>
                <div className={styles.dpadSide} />
                <div className={styles.dpadCenter} />
                <div className={styles.dpadSide} />
              </div>
              <div className={`${styles.dpadRow} ${styles.dpadBottom}`} />
            </div>
          </div>
        </div>

        {/* ─── FOLD ─── */}
        <div className={styles.fold} />

        {/* ─── RIGHT PANEL ─── */}
        <div className={styles.rightPanel}>
          {/* Green display */}
          <div className={styles.greenDisplay}>
            {loading
              ? 'SEARCHING...'
              : pokemon
                ? screenText
                : 'WAITING FOR INPUT...'}
          </div>

          {/* Stats grid */}
          {pokemon && !loading && (
            <div className={styles.statsGrid}>
              {pokemon.stats.map(s => (
                <div key={s.stat.name} className={styles.statRow}>
                  <span className={styles.statName}>{STAT_ABBR[s.stat.name] || s.stat.name}</span>
                  <div className={styles.statBar}>
                    <div
                      className={styles.statFill}
                      style={{ width: `${Math.min(100, (s.base_stat / 255) * 100)}%` }}
                    />
                  </div>
                  <span className={styles.statVal}>{s.base_stat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Blue buttons (4×2) */}
          <div className={styles.blueButtons}>
            {[...Array(8)].map((_, i) => (
              <button key={i} className={styles.blueBtn} />
            ))}
          </div>

          {/* Status LEDs */}
          <div className={styles.statusRow}>
            <span className={styles.ledOrange} />
            <span className={styles.ledGreen} />
            <div className={styles.greenBar} />
            <div className={styles.orangeBar} />
          </div>

          {/* Yellow action buttons */}
          <div className={styles.yellowButtons}>
            <button className={styles.yellowBtn} onClick={() => { setPokemon(null); setQuery(''); setScreenText('READY...'); addLog('> Screen cleared.'); }}>
              CLEAR
            </button>
            <button className={styles.yellowBtn} onClick={() => {
              const rand = Math.floor(Math.random() * 898) + 1;
              setQuery(String(rand));
              setTimeout(() => { setQuery(String(rand)); }, 0);
              addLog(`> Random #${rand}...`);
            }}>
              RANDOM
            </button>
          </div>
        </div>
      </div>

      {/* ── SIDE PANEL ── */}
      <div className={styles.sidePanel}>
        <h1 className={styles.labTitle}>LABORATORY 11</h1>
        <p className={styles.labDesc}>
          In this lab, we will be building a fully functional Pokédex application
          using Next.js and the PokéAPI. The Pokédex will allow users to search for
          any Pokémon by name or ID and display detailed information about that Pokémon,
          including its stats, type, height, weight, and sprite image.
        </p>
        <p className={styles.labDesc} style={{ marginTop: '0.75rem' }}>
          This is a classic recreation of the Game Boy Pokédex interface with a modern
          twist using real Pokémon data from the PokéAPI.
        </p>
        <div className={styles.terminal}>
          {log.map((line, i) => (
            <p key={i} className={line.startsWith('>') ? styles.terminalCmd : styles.terminalLine}>
              {line}
            </p>
          ))}
          <p className={styles.terminalCursor}>{'> Ready to search...'}<span className={styles.blink}>█</span></p>
        </div>
      </div>
    </div>
  );
}
