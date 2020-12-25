import React, { useState, useMemo, useEffect } from 'react'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import YouTubeIcon from '@material-ui/icons/YouTube';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
// import parse from 'autosuggest-highlight/parse';
import debounce from 'lodash/debounce';
import axios from 'axios-jsonp-pro';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  autocomplete: {
    width: 300,
    backgroundColor: 'white',
  },
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
}));

const GOOGLE_AUTOCOMPLETE_URL: string = `https://clients1.google.com/complete/search`;
        
export default function UTubeVideo(props: any) {
    const classes = useStyles();
    const [value, setValue] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<string[]>([]);

    const fetchSuggestions = async (term: string, callback: (results?: string[]) => void) => {
        try {
            const data:any = await axios.jsonp(GOOGLE_AUTOCOMPLETE_URL, {
                params: {
                    client: "youtube",
                    hl: "en",
                    ds: "yt",
                    q: term,
                }
            });
            // console.log("jsonp results >> ", data);
            const results: string[] = data[1].map((item: any[]) => item[0]);
            callback(results);
        }
        catch(err) {
            console.log(err);
        }
    };

    const getSuggestions = useMemo(
        () =>
        debounce(async (request: string, callback: (results?: string[]) => void)  => {
            fetchSuggestions(request, callback);
          }, 
          300,
          {leading: false, trailing:true}),
        [],
    );

    useEffect(() => {
        let active = true;
    
        if (inputValue === '') {
          setOptions(value ? [value] : []);
          return undefined;
        }
    
        getSuggestions(inputValue, (results?: string[]) => {
          if (active) {
            let newOptions = [] as string[];
    
            if (value) {
              newOptions = [value];
            }
    
            if (results) {
              newOptions = [...newOptions, ...results];
            }
    
            setOptions(newOptions);
          }
        });
    
        return () => {
          active = false;
        };
      }, [value, inputValue, getSuggestions]);

      return (
        <div className={classes.container}>
          <Autocomplete
            id="google-map-demo"
            className={classes.autocomplete}
            getOptionLabel={(option) => option}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            onChange={(event: any, newValue: string | null) => {
              setOptions(newValue ? [newValue, ...options] : options);
              setValue(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Add a video" variant="outlined" fullWidth />
            )}
            renderOption={(option) => {
                // console.log(option);
              return (
                <Grid container alignItems="center">
                  <Grid item>
                    <YouTubeIcon className={classes.icon} />
                  </Grid>
                  <Grid item xs>
                    <span style={{ fontWeight: 400 }}>
                        {option}
                      </span>
                  </Grid>
                </Grid>
              );
            }}
          />
          <Button variant="text"
              color="primary"
              onClick={() => {
                  props.onAddToPlayList({search: inputValue})
              }}
          >
              Add
          </Button>
        </div>
      );
}