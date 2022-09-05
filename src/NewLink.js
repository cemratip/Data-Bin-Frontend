import './page.css';
import React, {useEffect, useState} from "react";
import axios from 'axios';
import { EyeIcon } from '@heroicons/react/24/solid';
import { EyeSlashIcon } from '@heroicons/react/24/solid';
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';
import { BiSave } from 'react-icons/bi';
import bcrypt from "bcryptjs";

export default function NewLink() {
    const [link, setLink] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [textTabVisible, setTextTabVisibility] = useState(true);
    const [textData, setTextData] = useState('');
    const [saved, setSaved] = useState(null);
    const [expiry, setExpiry] = useState('1d');
    const [passworded, setPassworded] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisibility] = useState(false);
    const [copied, setCopied] = useState(false);
    const [editable, setEditable] = useState(true);
    const frontendBaseURL = 'https://databin.co.uk/';
    const backendBaseURL = 'https://data-bin.herokuapp.com/';

    useEffect(() => {
        axios.get(backendBaseURL)
        .then(response => {
            setEndpoint(response.data);
            setLink(frontendBaseURL+response.data);
        })
    }, [])

    const onTextChange = e => {
        setTextData(e.target.value);
        setSaved(false);
    }

    const onPasswordChange = e => {
        if (e.target.value==='') {
            setPassworded(false);
            setPassword(e.target.value);
        } else {
            setPassworded(true);
            setPassword(e.target.value);
        }
        setSaved(false);
    }

    const onEditableChange = e => {
        setEditable(e.target.checked);
        setSaved(false);
    }

    const onExpiryChange = e => {
        setExpiry(e.target.value);
        setSaved(false);
    }

    const save = () => {
        if (!(saved == null)) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hashedPassword) {
                    const data = {
                        endpoint: endpoint,
                        editable: editable,
                        timeTillExpiry: expiry,
                        passworded: passworded,
                        password: hashedPassword,
                        text_content: textData,
                    }
                    axios.post(backendBaseURL, data);
                    setSaved(true);
                })
            })
        }
    }

    const clearText = () => {
        if (!(textData === '')) {
            setTextData('');
            setSaved(false);
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
    }

    return (
        <div className='text-gray-700 bg-gray-200'>
        <h1 className='pl-10 text-5xl bg-gray-700 text-white py-5'>NAME</h1>
            <div className='flex items-center pl-10 pt-10 pb-10'>
                <p className='text-4xl pr-5'>Your link</p>
                <input className='text-black border-2 border-black w-1/2 rounded px-2 text-4xl w-100' type='text' readOnly={true} value={link}></input>
                {!copied &&
                    <ClipboardDocumentIcon className='w-4 md:w-7 lg:w-11 cursor-pointer' onClick={copyToClipboard}/>
                }
                {copied &&
                    <ClipboardDocumentCheckIcon className='w-4 md:w-7 lg:w-11 cursor-pointer' onClick={copyToClipboard}/>
                }
            </div>
            <div className='flex items-center pl-10 pt-5 pb-5'>
                <label className='text-2xl pr-2'>Link expires in</label>
                <select className='border-2 border-black rounded-md' value={expiry} onChange={onExpiryChange}>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="30m">30m</option>
                    <option value="1h">1h</option>
                    <option value="3h">3h</option>
                    <option value="6h">6h</option>
                    <option value="12h">12h</option>
                    <option value="1d" defaultValue>1d</option>
                    <option value="7d">7d</option>
                    <option value="30d">30d</option>
                </select>
                <label className='pl-10 pr-2 text-2xl'>Password</label>
                <input className='border-2 border-black rounded px-1 w-2/12' type={passwordVisible ? "text" : "password"} placeholder='Leave empty for no password' value={password} onChange={onPasswordChange}/>
                {!passwordVisible &&
                    <EyeIcon className='w-3 md:w-4 lg:w-8 cursor-pointer' onClick={() => setPasswordVisibility(!passwordVisible)}/>
                }
                {passwordVisible &&
                    <EyeSlashIcon className='w-3 md:w-4 lg:w-8 cursor-pointer' onClick={() => setPasswordVisibility(!passwordVisible)}/>
                }
                <label className='text-2xl pl-10 pr-2'>Editable</label>
                <input className='w-6 h-6' type='checkbox' onChange={onEditableChange} checked={editable}/>
            </div>
            <div className='flex items-center pl-9 py-5 '>
                <BiSave className='w-12 h-12 cursor-pointer' onClick={save}/>
                {saved === true && (
                    <label className='text-green-600'>Changes saved</label>
                )}
                {saved === false && (
                    <label className='text-red-600'>Unsaved changes</label>
                )}
            </div>
            <div className='pl-10 pb-10'>
                <p className='text-2xl border-t-2 border-l-2 border-r-2 border-gray-700 bg-gray-700 text-white rounded-t-lg px-2 w-16 cursor-pointer' onClick={e => setTextTabVisibility(true)}>Text</p>
                {textTabVisible && (
                    <div className='h-screen'>
                        <textarea className='px-1 overscroll-none w-1/2 h-1/2 border-2 border-gray-700 text-2xl drop-shadow-xl md:resize max-h-full rounded-b-lg rounded-r-md' maxLength="50000" value={textData} onChange={onTextChange}></textarea>
                        <div className='flex items-center space-x-3 overscroll-none'>
                            <button className='border-2 border-gray-700 bg-gray-700 drop-shadow-lg text-white py-1 px-2 rounded text-lg' onClick={clearText}>Clear Text</button>
                            <button className='border-2 border-gray-700 bg-gray-700 drop-shadow-lg text-white py-1 px-2 rounded text-lg' onClick={() => navigator.clipboard.writeText(textData)}>Copy Text</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}