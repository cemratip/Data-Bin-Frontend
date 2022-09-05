import './page.css';
import {ClipboardDocumentCheckIcon, ClipboardDocumentIcon, EyeIcon} from '@heroicons/react/24/solid';
import { EyeSlashIcon } from '@heroicons/react/24/solid';
import logo from './logo.png';
import React, {useEffect, useState} from "react";
import axios from 'axios';
import {BiSave} from "react-icons/bi";

export default function ExistingLink() {
    const [textTabVisible, setTextTabVisibility] = useState(true);
    const [textData, setTextData] = useState('');
    const [saved, setSaved] = useState(null);
    const [expiry, setExpiry] = useState();
    const [editable, setEditable] = useState();
    const [passworded, setPassworded] = useState(null);
    const [password, setPassword] = useState();
    const [passwordVisible, setPasswordVisibility] = useState(false);
    const [incorrectPassword, setIncorrectPassword] = useState(false);
    const [linkNotFound, setLinkNotFound] = useState(false);
    const [copied, setCopied] = useState(false);
    const frontendBaseURL = 'https://databin.co.uk/';
    const backendBaseURL = 'https://data-bin.herokuapp.com/';
    const endpoint = window.location.href.replace(frontendBaseURL, '');
    const linkToDisplay = frontendBaseURL + endpoint;
    const linkToCall = backendBaseURL + endpoint;

    useEffect(() => {
        axios.get(linkToCall + '/locked')
            .then(response => {
                if (response.data === true) {
                    setPassworded(true);
                } else if (response.data === false) {
                    setPassworded(false);
                    loadData();
                }
            })
            .catch(error => {
                if (error.response.status === 404) {
                    setLinkNotFound(true);
                }
            })
    }, [linkToCall])

    const loadData = () => {
        axios.get(linkToCall)
            .then(response => {
                setEditable(response.data.editable);
                setTextData(response.data.text_content);
                const expiryDate = new Date(response.data.expireAt);
                const expiryDateFormatted = expiryDate.toLocaleDateString();
                const expiryTimeFormatted = expiryDate.toLocaleTimeString();
                const formattedDatetime = expiryTimeFormatted + ' ' + expiryDateFormatted;
                setExpiry(formattedDatetime);
            })
    }

    const onTextChange = e => {
        setTextData(e.target.value);
        setSaved(false);
    }

    const clearText = () => {
        if (!(textData === '')) {
            setTextData('');
            setSaved(false);
        }
    }

    const onPasswordChange = e => {
        setPassword(e.target.value);
        setIncorrectPassword(false);
    }

    const save = () => {
        if (!(saved == null)) {
            const data = {
                endpoint: endpoint,
                text_content: textData,
            }
            axios.post(backendBaseURL, data);
            setSaved(true);
        }
    }

    const verifyPassword = () => {
        const data = {
            endpoint: endpoint,
            password: password,
        }
        axios.post(backendBaseURL+'verify', data)
            .then(response => {
                if (response.data === false) {
                    setIncorrectPassword(true);
                } else {
                    loadData();
                }
                setPassworded(!response.data);
            })
    }

    const enterPressed = e => {
        const code = e.keyCode || e.which;
        if (code === 13) {
            verifyPassword();
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(linkToDisplay);
        setCopied(true);
    }

    return (
        <div className='text-gray-700 bg-gray-200'>
            <div className='pl-10 text-5xl bg-gray-700 text-white py-5'>
                <img className='w-35 h-10' src={logo} alt=''></img>
            </div>
            {linkNotFound &&
                <div className='h-screen'>
                    <p className='text-5xl text-center pt-24'>Link Not Found</p>
                </div>
            }
            {!linkNotFound && passworded &&
                <div className='h-screen pl-10 text-center'>
                    <p className='text-4xl pr-5 pt-24'>Enter password</p>
                    <div className='flex items-center space-x-2 pt-10 justify-center'>
                        <input className='border-2 border-black rounded px-1' type={passwordVisible ? "text" : "password"} onKeyPress={enterPressed} value={password} onChange={onPasswordChange}/>
                        {!passwordVisible &&
                            <EyeIcon className='w-3 md:w-4 lg:w-8 cursor-pointer' onClick={() => setPasswordVisibility(!passwordVisible)}/>
                        }
                        {passwordVisible &&
                            <EyeSlashIcon className='w-3 md:w-4 lg:w-8 cursor-pointer' onClick={() => setPasswordVisibility(!passwordVisible)}/>
                        }
                    </div>
                    {!incorrectPassword &&
                        <div className='pr-24'>
                            <p className='text-transparent'>Incorrect password</p>
                        </div>
                    }
                    {incorrectPassword &&
                        <div className='pr-24'>
                            <p className='text-red-600'>Incorrect password</p>
                        </div>
                    }
                    <div className='pt-5'>
                        <button className='border-2 border-gray-700 bg-gray-700 drop-shadow-lg text-white py-1 px-2 rounded text-lg' onClick={verifyPassword}>Confirm</button>
                    </div>
                </div>
            }
            {!linkNotFound && !passworded &&
                <div>
                    <div className='flex items-center pl-10 pt-10 pb-10'>
                        <p className='text-4xl pr-5'>Your link</p>
                        <input className='text-black border-2 border-black w-1/2 rounded px-2 text-4xl w-100' type='text' readOnly={true} value={linkToDisplay}></input>
                        {!copied &&
                            <ClipboardDocumentIcon className='w-4 md:w-7 lg:w-11 cursor-pointer' onClick={copyToClipboard}/>
                        }
                        {copied &&
                            <ClipboardDocumentCheckIcon className='w-4 md:w-7 lg:w-11 cursor-pointer' onClick={copyToClipboard}/>
                        }
                    </div>
                    <div className='pl-10 pt-5 pb-5'>
                        <label className='text-2xl pr-2'>Link expires at {expiry}</label>
                    </div>
                    <div className='flex items-center pl-9 py-5'>
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
            }
        </div>
    );
}