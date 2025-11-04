import { createAsyncThunk } from '@reduxjs/toolkit';
import { InputCreatorIdType } from 'livepeer/models/components';
import api from '../utils/api'; // Assuming you have an axios instance setup
import axios from 'axios';
import { Livepeer } from 'livepeer';
import backendApi from '../utils/backendApi';

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

// const livepeer = new Livepeer({
//   apiKey: process.env.NEXT_PUBLIC_STUDIO_API_KEY ?? '',
// });

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

      // Step 2: Send additional data to the second endpoint
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

      if (secondResponse.status !== 200) {
        throw new Error('Failed to send data to the second endpoint');
      }

      return response.data;
    } catch (error: any) {
      console.log('Error creating livestream:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllStreams = createAsyncThunk('streams/getAllStreams', async () => {
  // Step 1: Get all streams from Livepeer
  const response = await api.get('/stream');
  const streams = response.data;

  // Step 2: Enrich each stream with logo from backend server
  const enrichedStreams = await Promise.all(
    streams.map(async (stream: any) => {
      if (!stream.playbackId) {
        return { ...stream, logo: '' };
      }

      try {
        // Fetch stream details from backend server
        const backendResponse = await backendApi.get(
          `/streams/getstream?playbackId=${stream.playbackId}`
        );
        
        // Merge the logo (and other backend data like title) into the stream
        return {
          ...stream,
          logo: backendResponse.data.stream?.logo || stream.logo || '',
          title: backendResponse.data.stream?.title || backendResponse.data.stream?.streamName || stream.name || stream.title || '',
        };
      } catch (error) {
        // If backend fetch fails, return stream without logo
        console.warn(`Failed to fetch logo for stream ${stream.playbackId}:`, error);
        return { ...stream, logo: stream.logo || '' };
      }
    })
  );

  return enrichedStreams;
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
  async ({ id, record, name }: UpdateLivestreamProps) => {
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
