import { atom } from 'recoil';

export const usernameState = atom({
    key: 'usernameState',
    default: ''
})

export const myDocumentsState = atom({
    key: 'myDocumentsState',
    default: []
})