import { createAsyncThunk } from '@reduxjs/toolkit';
import { InputCreatorIdType } from 'livepeer/models/components';
import api from '../utils/api'; // Assuming you have an axios instance setup
import axios from 'axios';

interface CreateLivestreamProps {
  streamName: string;
  record: boolean;
  creatorId: string;
  viewMode?: 'free' | 'one-time' | 'monthly';
  amount?: number;
  description: string;
  bgcolor: string;
  color: string;
  fontSize: string;
  logo: string;
  donation?: number[];
}

interface UpdateLivestreamProps {
  id: string;
  record?: boolean;
  creatorId?: string;
  name?: string;
  suspended?: boolean;
}

export const createLivestream = createAsyncThunk(
  'streams/createLivestream',
  async (
    {
      streamName,
      record,
      creatorId,
      viewMode,
      amount,
      description,
      bgcolor,
      color,
      fontSize,
      logo,
      donation,
    }: CreateLivestreamProps,
    { rejectWithValue },
  ) => {
    try {
      // Step 1: Create the livestream
      const response = await api.post('/stream', {
        name: streamName,
        record,
        creatorId: {
          type: InputCreatorIdType.Unverified,
          value: creatorId,
        },
      });

      const { playbackId, name } = response.data;

      // Step 2: Send the response data to another endpoint
      // const data = {
      //   playbackId,
      //   viewMode,
      //   description,
      //   amount,
      //   streamName: name || streamName,
      //   creatorId,
      //   logo,
      //   bgColor,
      //   color,
      //   fontSize,
      //   donation,
      // };
      // console.log('Data to be sent:', data);
      const secondResponse = await axios.post(`https://chaintv.onrender.com/api/streams/addstream`, {
        playbackId,
        viewMode,
        description,
        amount,
        streamName: name || streamName,
        title: name || streamName,
        creatorId,
        logo,
        bgcolor,
        color,
        fontSize,
        donation,
      });
      if (secondResponse.status === 200) {
        // console.log('Data sent successfully:', data);
      } else if (secondResponse.status !== 200) {
        console.error('Error sending data:', secondResponse.data);
      } else {
        console.error('Unexpected response:', secondResponse);
      }
      return response.data;
    } catch (error: any) {
      console.log('Error creating livestream:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllStreams = createAsyncThunk('streams/getAllStreams', async () => {
  const response = await api.get('/stream');
  return response.data;
});

export const deleteStream = createAsyncThunk('streams/deleteStream', async (id: string) => {
  await api.delete(`/stream/${id}`);
  return id;
});

export const getStreamById = createAsyncThunk('streams/getStreamById', async (id: string) => {
  const response = await api.get(`/stream/${id}`);
  return response.data;
});

export const updateLivestream = createAsyncThunk(
  'streams/updateStream',
  async ({ id, record, creatorId, name }: UpdateLivestreamProps) => {
    const response = await api.patch(`/stream/${id}`, {
      name: name,
      record,
      // creatorId: {
      //   type: InputCreatorIdType.Unverified,
      //   value: creatorId,
      // },
    });
    return response.data;
  },
);
//
export const terminateStream = createAsyncThunk('streams/terminateStream', async (id: string) => {
  await api.delete(`/stream/${id}/terminate`);
  return id;
});
