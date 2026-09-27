import { AirlineInfo } from '../types';

export const AIRLINES: Record<string, AirlineInfo> = {
  '6E': {
    code: '6E',
    name: 'IndiGo',
    nameHi: 'इंडिगो',
    type: 'LCC',
    color: '#0052cc',
  },
  'AI': {
    code: 'AI',
    name: 'Air India',
    nameHi: 'एयर इंडिया',
    type: 'FSC',
    color: '#d9232a',
  },
  'IX': {
    code: 'IX',
    name: 'Air India Express',
    nameHi: 'एयर इंडिया एक्सप्रेस',
    type: 'LCC',
    color: '#e05a1b',
  },
  'QP': {
    code: 'QP',
    name: 'Akasa Air',
    nameHi: 'आकासा एयर',
    type: 'LCC',
    color: '#ff6600',
  },
  'SG': {
    code: 'SG',
    name: 'SpiceJet',
    nameHi: 'स्पाइसजेट',
    type: 'LCC',
    color: '#cc1100',
  },
};

export const AIRLINE_LIST = Object.values(AIRLINES);
