import React from 'react';
import VideoSearch, { GOOGLE_AUTOCOMPLETE_URL } from './VideoSearch';
import {render as rtlRender, screen, fireEvent} from '@testing-library/react'
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get(GOOGLE_AUTOCOMPLETE_URL, (req:any, res:any, ctx:any) => {
      console.log('server called')
    return res(ctx.json([0,[
        ["netta"],
        ["netta2"]
    ]]))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function render(addToPlayListCallback: (event: {search: string}) => void): any {
    const {findByLabelText, getByLabelText, getByText, findByText, getByPlaceholderText, debug} = rtlRender(
        <VideoSearch onAddToPlayList={addToPlayListCallback}></VideoSearch>    
    )
    return {
        debug,
        getByText,
        findByText,
        findByLabelText,
        input: getByLabelText(/Add a video/i),
    }
}
test('renders videosearch', () => {
    render((event: {search: string}) => {
    });
    const autocompleteElement = screen.getByTestId('autocomplete');
    expect(autocompleteElement).toBeInTheDocument();
    const inputElement = screen.getByLabelText(/Add a video/i);
    expect(inputElement).toBeInTheDocument();
});