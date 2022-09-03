import './page.css';
import saveicon from './saveicon.png';
import showicon from './showicon.jpg';
import hideicon from './hideicon.jpg';
import React, {useEffect, useState} from "react";
import axios from 'axios';

export default function ExistingLink() {
    const [textTabVisible, setTextTabVisibility] = useState(true);
    const [textData, setTextData] = useState('');
    const [saved, setSaved] = useState(null);
    const [expiry, setExpiry] = useState();
    const [editable, setEditable] = useState();
    const [passworded, setPassworded] = useState(null);
    const [password, setPassword] = useState();
    const [passwordVisible, setPasswordVisibility] = useState(false);
    const [visibilityIcon, setVisibilityIcon] = useState(showicon);
    const [incorrectPassword, setIncorrectPassword] = useState(false);
    const [linkNotFound, setLinkNotFound] = useState(false);
    const frontendBaseURL = 'https://data-bin-frontend.herokuapp.com/';
    const backendBaseURL = 'https://data-bin.herokuapp.com/';
    const endpoint = window.location.href.replace('https://data-bin-frontend.herokuapp.com/', '');
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

    const changePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisible);
        if (!passwordVisible) {
            setVisibilityIcon(hideicon);
        } else {
            setVisibilityIcon(showicon);
        }
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

    return (
        <div>
            {linkNotFound &&
                <div>
                    <h1>Link Not Found</h1>
                </div>
            }
            {!linkNotFound && passworded &&
                <div>
                    <h1>Enter password</h1>
                    <input type={passwordVisible ? 'text' : 'password'} className='passwordInput' onKeyPress={enterPressed} value={password} onChange={onPasswordChange}/>
                    <img className='passwordVisibilityBtn' src={visibilityIcon} alt='' onClick={changePasswordVisibility}/>
                    <button onClick={verifyPassword}>Confirm</button>
                    {incorrectPassword &&
                        <div>
                            <p className='unsavedstatus'>Incorrect password</p>
                        </div>
                    }
                </div>
            }
            {!linkNotFound && !passworded &&
                <div>
                    <div className='linkpane'>
                        <h1>Your link</h1>
                        <textarea readOnly={true} className='linkBox' value={linkToDisplay}></textarea>
                        <button onClick={() => navigator.clipboard.writeText(linkToDisplay)}>Copy</button>
                    </div>
                    <div className='toolpane'>
                        <label>Link expires at {expiry}</label>
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
                        <button className='textTab' onClick={() => setTextTabVisibility(true)}>Text</button>
                    </div>
                    {textTabVisible && (
                        <div>
                            <textarea className='textInput' maxLength="50000" readOnly={!editable} value={textData} onChange={onTextChange}></textarea>
                            <div>
                                {editable &&
                                    <button onClick={clearText}>Clear Text</button>
                                }
                                <button onClick={() => navigator.clipboard.writeText(textData)}>Copy Text</button>
                            </div>
                        </div>
                    )}
                </div>
            }
        </div>
    );
}