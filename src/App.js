// LinkedListVisualizer.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Node = (val) => ({
  value: val,
  next: null,
  prev: null,
  id: Date.now() + Math.random().toString(36).substr(2, 9),
});

const LIST_TYPES = { SINGLY: 'singly', DOUBLY: 'doubly', CIRCULAR: 'circular' };

export default function LinkedListVisualizer() {
  const [list, setList] = useState([]);
  const [listType, setListType] = useState(LIST_TYPES.SINGLY);
  const [value, setValue] = useState('');
  const [position, setPosition] = useState('');
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState(null);
  const [op, setOp] = useState(null);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const link = (nodes) => {
    nodes.forEach((n, i) => {
      n.next = nodes[i + 1] || null;
      n.prev = null;
      if (listType === LIST_TYPES.DOUBLY) n.prev = nodes[i - 1] || null;
    });
    if (listType === LIST_TYPES.CIRCULAR && nodes.length) {
      nodes[nodes.length - 1].next = nodes[0];
      if (listType === LIST_TYPES.DOUBLY) nodes[0].prev = nodes[nodes.length - 1];
    }
  };

  const updateList = async (newList, opType, nodeId) => {
    setOp(opType);
    setActive(nodeId);
    await delay(500);
    link(newList);
    setList(newList);
    reset();
  };

  const insert = async (pos) => {
    if (!value || isNaN(value)) return;
    const n = Node(parseInt(value));
    const l = [...list];
    const i = parseInt(position);
    if (pos === 'start') return updateList([n, ...l], 'ins-start', n.id);
    if (pos === 'end') return updateList([...l, n], 'ins-end', n.id);
    if (!isNaN(i) && i >= 0 && i <= l.length) {
      l.splice(i, 0, n);
      return updateList(l, 'ins-pos', n.id);
    }
  };

  const remove = async (by) => {
    const l = [...list];
    const i = by === 'value' ? l.findIndex(n => n.value === parseInt(value)) : parseInt(position);
    if (isNaN(i) || i < 0 || i >= l.length) return reset();
    const id = l[i].id;
    l.splice(i, 1);
    return updateList(l, `del-${by}`, id);
  };

  const reverse = async () => {
    setOp('rev');
    const reversed = [...list].reverse().map((n, i, arr) => {
      n.next = arr[i + 1] || null;
      n.prev = listType === LIST_TYPES.DOUBLY ? arr[i - 1] || null : null;
      return n;
    });
    if (listType === LIST_TYPES.CIRCULAR && reversed.length) {
      reversed[reversed.length - 1].next = reversed[0];
      if (listType === LIST_TYPES.DOUBLY) reversed[0].prev = reversed[reversed.length - 1];
    }
    setList(reversed);
    reset();
  };

  const reset = () => {
    setOp(null);
    setActive(null);
    setValue('');
    setPosition('');
  };

  const color = (n) => (n.id === active ? 'bg-purple-500' : dark ? 'bg-blue-600' : 'bg-blue-500');

  useEffect(() => {
    if (list.length) setList(link([...list]) || list);
  }, [listType]);

  const clearList = () => {
    setList([]);
    reset();
  };

  return (
    <div className={`min-h-screen ${dark ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-blue-100 to-white'}`}>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-extrabold tracking-wide ${dark ? 'text-pink-400' : 'text-blue-800'}`}>✨ Linked List Visualizer</h1>
          <button onClick={() => setDark(!dark)} className={`px-4 py-2 rounded-lg shadow-md font-semibold ${dark ? 'bg-yellow-300 text-black' : 'bg-gray-800 text-white'}`}>{dark ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
        </header>

        <div className={`p-6 rounded-xl mb-8 shadow-2xl border-4 ${dark ? 'bg-gray-800 border-pink-500' : 'bg-white border-blue-400'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[['List Type', listType, setListType, Object.values(LIST_TYPES)], ['Node Value', value, setValue], ['Position', position, setPosition]].map(([label, val, set, options], i) => (
              <div key={i}>
                <h3 className="font-bold mb-2 text-lg text-indigo-400 uppercase tracking-wide">{label}</h3>
                {options ? (
                  <div className="flex space-x-2">
                    {options.map(o => <button key={o} onClick={() => set(o)} className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide transition transform hover:scale-105 shadow-md ${val === o ? (dark ? 'bg-pink-500 text-white' : 'bg-blue-600 text-white') : (dark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black')}`}>{o}</button>)}
                  </div>
                ) : (
                  <input type="number" value={val} onChange={(e) => set(e.target.value)} className={`w-full px-3 py-2 rounded-lg shadow-inner border-2 font-mono text-lg ${dark ? 'bg-gray-700 text-white border-pink-400' : 'bg-white border-blue-300'}`} placeholder={label} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[['Insert Start', () => insert('start'), 'bg-green-500'], ['Insert End', () => insert('end'), 'bg-green-400'], ['Insert At', () => insert('position'), 'bg-blue-500'], ['Delete Value', () => remove('value'), 'bg-red-500'], ['Delete At', () => remove('position'), 'bg-red-400'], ['Reverse', reverse, 'bg-purple-500'], ['Reset', clearList, 'bg-yellow-400']].map(([label, func, color], i) => (
              <button key={i} onClick={func} className={`py-2 rounded-xl text-white text-sm font-semibold tracking-wide shadow-lg hover:brightness-110 transform hover:scale-105 transition ${color}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-xl ${dark ? 'bg-gray-800 border-2 border-pink-300' : 'bg-white border-2 border-blue-300'}`}>
          <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-300">Linked List Representation</h2>
          {list.length === 0 ? (
            <div className={`text-center py-8 font-mono ${dark ? 'text-gray-400' : 'text-gray-500'}`}>🚫 List is empty. Add nodes to begin!</div>
          ) : (
            <div className="flex items-center justify-center overflow-x-auto py-4">
              <AnimatePresence>
                {list.map((n, i) => (
                  <Fragment key={n.id}>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center mx-2">
                      <div className={`w-32 h-20 rounded-lg border-2 p-2 ${color(n)} flex flex-col items-center justify-center text-white font-mono shadow-md`}>
                        <div className="text-sm font-bold">🧱 Data: {n.value}</div>
                        <div className="text-xs">➡️ Next: {n.next ? n.next.value : 'null'}</div>
                        {listType === LIST_TYPES.DOUBLY && <div className="text-xs">⬅️ Prev: {n.prev ? n.prev.value : 'null'}</div>}
                      </div>
                      <span className="text-xs mt-1 font-bold text-pink-300">Node {i}</span>
                    </motion.div>
                    {i < list.length - 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={dark ? '#f9a8d4' : '#4b5563'}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></motion.div>}
                    {i === list.length - 1 && listType === LIST_TYPES.CIRCULAR && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 text-sm italic text-pink-400">↻ Circular Link</motion.div>}
                  </Fragment>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
