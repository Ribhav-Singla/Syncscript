import { atom } from 'recoil';

export const usernameState = atom({
    key: 'usernameState',
    default: ''
})

export const filenameState = atom({
    key: 'filename',
    default: '',
})