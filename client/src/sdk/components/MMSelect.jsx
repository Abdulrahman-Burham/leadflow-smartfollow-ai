import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './MMSelect.css';

/**
 * MMSelect - Custom Dropdown
 * 
 * @param {string} value - Current value
 * @param {function} onChange - Handle change (value)
 * @param {Array} options - [{ value: 'a', label: 'Option A' }]
 * @param {string} placeholder - Default text
 */
const MMSelect = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (typeof onChange === 'function') {
            const syntheticEvent = {
                target: { value: optionValue },
                currentTarget: { value: optionValue }
            };
            onChange(syntheticEvent, optionValue);
        }
        setIsOpen(false);
    };

    return (
        <div
            className={`mm-select-container ${className} ${isOpen ? 'is-open' : ''}`}
            ref={containerRef}
        >
            <div
                className="mm-select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`mm-select-value ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className="mm-select-icon" />
            </div>

            {isOpen && (
                <div className="mm-select-dropdown">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`mm-select-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MMSelect;
