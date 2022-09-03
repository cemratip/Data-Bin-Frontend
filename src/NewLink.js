import './page.css';
import React, {useEffect, useState} from "react";
import axios from 'axios';
import saveicon from './saveicon.png';
import showicon from "./showicon.jpg";
import hideicon from "./hideicon.jpg";
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
    const [visibilityIcon, setVisibilityIcon] = useState(showicon);
    const [editable, setEditable] = useState(true);
    const frontendBaseURL = 'https://data-bin-frontend.herokuapp.com/';
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

    const changePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisible);
        if (!passwordVisible) {
            setVisibilityIcon(hideicon);
        } else {
            setVisibilityIcon(showicon);
        }
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

    return (
        <div>
            <div className='linkpane'>
                <h1>Your link</h1>
                <textarea readOnly={true} className='linkBox' value={link}></textarea>
                <button onClick={() => navigator.clipboard.writeText(link)}>Copy</button>
            </div>
            <div className='toolpane'>
                <label>Link expires in</label>
                <select value={expiry} onChange={onExpiryChange}>
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
                <label>Password: </label>
                <input type={passwordVisible ? "text" : "password"} className='passwordInput' placeholder='Leave empty for no password' value={password} onChange={onPasswordChange}/>
                <img className='passwordVisibilityBtn' src={visibilityIcon} alt='' onClick={changePasswordVisibility}/>
                <label>Editable</label>
                <input type='checkbox' onChange={onEditableChange} checked={editable}/>
                <div>
                    <img className='saveBtn' src={saveicon} alt='' onClick={save}/>
                    {saved === true && (
                        <label className='savedstatus'>Changes saved</label>
                    )}
                    {saved === false && (
                        <label className='unsavedstatus'>Unsaved changes</label>
                    )}
                </div>
            </div>
            <div className='tabs'>
                <button className='textTab' onClick={e => setTextTabVisibility(true)}>Text</button>
            </div>
            {textTabVisible && (
                <div>
                    <textarea className='textInput' maxLength="50000" value={textData} onChange={onTextChange}></textarea>
                    <div>
                        <button onClick={clearText}>Clear Text</button>
                        <button onClick={() => navigator.clipboard.writeText(textData)}>Copy Text</button>
                    </div>
                </div>
            )}
        </div>
    );
}