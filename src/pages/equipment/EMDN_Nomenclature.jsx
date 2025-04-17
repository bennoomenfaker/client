import  { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEMDNCodes } from "../../redux/slices/emdnNomenclatureSlice";
import { FormControl, Typography } from "@mui/material";
import NavBar from "../../components/NavBar";
import { Autocomplete, TextField } from "@mui/material";

const EMDN_Nomenclature = () => {
    const dispatch = useDispatch();
    const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);
    const [selectedOptions, setSelectedOptions] = useState(Array(7).fill(''));
    const [isNavOpen, setIsNavOpen] = useState(true);
    
    useEffect(() => {
        if (emdn.length === 0) {
            dispatch(fetchEMDNCodes());
        }
    }, [dispatch, emdn]);

    const handleChange = (level, value) => {
        const newSelectedOptions = [...selectedOptions];
        newSelectedOptions[level] = value;
        for (let i = level + 1; i < newSelectedOptions.length; i++) {
            newSelectedOptions[i] = '';
        }
        setSelectedOptions(newSelectedOptions);
    };

    const getOptions = (level) => {
        if (level === 0) return emdn;
        let currentLevel = emdn;
        for (let i = 0; i < level; i++) {
            const selected = currentLevel.find(item => item.code === selectedOptions[i]);
            if (selected && selected.subtypes) {
                currentLevel = selected.subtypes;
            } else {
                return [];
            }
        }
        return currentLevel;
    };

    return (
        <div style={{ display: "flex" }}>
            <NavBar onToggle={setIsNavOpen} />
            <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>

            <Typography variant="body1" gutterBottom>EMDN Nomenclature</Typography>
            {selectedOptions.map((selectedOption, level) => {
    const options = getOptions(level);
    return (
        options.length > 0 && (
            <FormControl fullWidth key={level} margin="normal">
                <Autocomplete
                    options={options}
                    getOptionLabel={(option) => `${option.code} - ${option.nom}`}
                    value={options.find(opt => opt.code === selectedOption) || null}
                    onChange={(event, newValue) => handleChange(level, newValue ? newValue.code : '')}
                    renderInput={(params) => (
                        <TextField {...params} label={`Level ${level + 1}`} variant="outlined" />
                    )}
                />
            </FormControl>
        )
    );
})}

            </div>
        </div>
    );
};

export default EMDN_Nomenclature;
