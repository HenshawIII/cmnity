'use client';
import { clsx } from 'clsx';
import React, { useState, useEffect } from 'react';
import InputField from '@/components/ui/InputField';
import { RiVideoAddLine } from 'react-icons/ri';
import { RotatingLines } from 'react-loader-spinner';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';
import { createLivestream, getAllStreams } from '@/features/streamAPI';
import { resetStreamStatus } from '@/features/streamSlice';
import Image from 'next/image';
import { AppDispatch, RootState } from '@/store/store';

/**
 * Extend formData with customization fields
 */
type viewMode = 'free' | 'one-time' | 'monthly';

interface CreateLivestreamProps {
  close: () => void;
}

export function CreateLivestream({ close }: CreateLivestreamProps) {
  const { user } = usePrivy();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector((state: RootState) => state.streams);
  const [formData, setFormData] = useState({
    streamName: '',
    record: false,
    creatorId: user?.wallet?.address || '',
    viewMode: 'free' as viewMode,
    amount: 0,
    channelDescription: '',
    bgcolor: '#ffffff',
    color: '#000000',
    fontSize: '16',
    logo: '' as string,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [presetValues, setPresetValues] = useState<number[]>([0, 0, 0, 0]);
  // keep creatorId in sync
  useEffect(() => {
    setFormData((prev) => ({ ...prev, creatorId: user?.wallet?.address || '' }));
  }, [user?.wallet?.address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsed: string | boolean | number = value;
    if (name === 'record') parsed = value === 'yes';
    if (name === 'amount') parsed = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [name]: parsed }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleviewModeChange = (option: viewMode) => {
    setFormData((prev) => ({ ...prev, viewMode: option, amount: option === 'free' ? 0 : prev.amount }));
    if (errors.viewMode) {
      setErrors((prev) => {
        const { viewMode, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        logo: reader.result as string, // <-- reader.result is a data URL (string)
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePresetChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newVals = [...presetValues];
    newVals[index] = parseFloat(e.target.value) || 0;
    setPresetValues(newVals);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // validation
    const newErrors: Record<string, string> = {};
    if (!formData.streamName) newErrors.streamName = 'Required';
    if (!formData.creatorId) newErrors.creatorId = 'Required';
    if (formData.viewMode !== 'free' && (!formData.amount || formData.amount <= 0)) {
      newErrors.amount = 'Invalid amount';
    }
    if (!formData.channelDescription) {
      newErrors.channelDescription = 'Required';
    } else {
      // Enforce max 50 words
      const words = formData.channelDescription.trim().split(/\s+/).filter(Boolean);
      if (words.length < 50) {
        newErrors.channelDescription = 'Description must be 50 words or above';
      }
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    console.log('formData', formData);
    try {
      const payload = {
        streamName: formData.streamName,
        record: formData.record,
        creatorId: formData.creatorId,
        viewMode: formData.viewMode,
        amount: formData.amount,
        description: formData.channelDescription,
        bgcolor: formData.bgcolor,
        color: formData.color,
        fontSize: formData.fontSize,
        logo: formData.logo,
        donation: presetValues,
      };
      const response = await dispatch(createLivestream(payload)).unwrap();
      console.log('Stream created successfully:', response);
      toast.success('Stream created');
      dispatch(getAllStreams());
      dispatch(resetStreamStatus());
      close();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create');
      dispatch(resetStreamStatus());
    }
  };

  const presetBg = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'];
  const presetText = ['#000000', '#ffffff', '#ff00ff', '#00ffff', '#888888'];

  return (
    <div className=" flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4 pr-2">
        {/* Logo Upload - centered at top */}
        <div className="flex justify-center flex-col items-center mt-2 mb-4">
          <div className="relative w-24 h-20 border-dashed border rounded overflow-hidden">
            {formData.logo ? (
              <Image src={formData.logo} alt="Logo" fill className="object-contain w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500 text-xs">No Logo</span>
              </div>
            )}
          </div>

          <input id="logoUpload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            type="button"
            onClick={() => document.getElementById('logoUpload')?.click()}
            className="ml-4 mt-3 text-sm px-4 py-1 bg-main-blue text-white rounded"
          >
            Select Logo
          </button>
        </div>

        {/* Stream Name */}
        <div className="flex flex-col">
          <label className="text-sm pb-1 font-medium">Stream Name</label>
          <InputField
            type="text"
            name="streamName"
            value={formData.streamName}
            onChange={handleChange}
            placeholder="Enter stream name"
            className={clsx('border p-2 rounded', { 'border-red-500': errors.streamName })}
          />
          {errors.streamName && <p className="text-red-500 text-xs">{errors.streamName}</p>}
        </div>

        {/* Record Option */}
        <div className="flex flex-col">
          <label className="text-sm pb-1 font-medium">Record Stream?</label>
          <select
            name="record"
            value={formData.record ? 'yes' : 'no'}
            onChange={handleChange}
            className="p-2 border text-sm rounded"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex flex-col">
          <label className="text-sm pb-1 font-medium">View Mode</label>
          <div className="flex gap-2 flex-wrap">
            {(['free', 'one-time', 'monthly'] as viewMode[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleviewModeChange(option)}
                className={clsx(
                  'px-4 py-1 border capitalize text-sm rounded',
                  formData.viewMode === option ? 'bg-main-blue text-white' : 'bg-white',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        {formData.viewMode !== 'free' && (
          <div className="flex flex-col">
            <label className="text-sm pb-1 font-medium">Amount($)</label>
            <InputField
              label="Amount"
              name="amount"
              type="number"
              value={String(formData.amount)}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className={clsx('border p-2 rounded', { 'border-red-500': errors.amount })}
            />
            {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
          </div>
        )}

        {/* Creator ID */}
        <div className="flex flex-col">
          <label htmlFor="creatorId" className="block text-sm font-medium pb-1 text-gray-900">
            Creator ID
          </label>
          <InputField
            type="text"
            label="Creator ID"
            name="creatorId"
            value={formData.creatorId}
            readOnly
            className="border p-2 bg-gray-100 rounded"
          />
        </div>

        {/* Channel Description (textarea) */}
        <div className="flex flex-col">
          <label className="text-sm pb-1 font-medium">
            Channel Description <span className="text-xs text-gray-500">(max 50 words)</span>
          </label>
          <textarea
            name="channelDescription"
            value={formData.channelDescription}
            onChange={handleChange}
            placeholder="Short description"
            className={clsx('border p-2 text-sm rounded w-full h-24', {
              'border-red-500': errors.channelDescription,
            })}
          />
          {/* live word count */}
          <p className="text-xs text-gray-500 mt-1">
            {formData.channelDescription.trim().split(/\s+/).filter(Boolean).length} / 50 words
          </p>
          {errors.channelDescription && <p className="text-red-500 text-xs">{errors.channelDescription}</p>}
        </div>
        <div className="flex flex-col">
          <label className="text-sm pb-1 font-medium text-black">Donation Presets</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {presetValues.map((value, i) => (
              <input
                key={i}
                type="text"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={(e) => handlePresetChange(i, e)}
                min="0"
                placeholder={`Preset Amount ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* BG & Text Color Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Background Color */}
          <div className="flex flex-col">
            <label className="text-sm pb-1 font-medium">Background Color</label>
            <div className="flex items-center gap-2 wrap">
              {presetBg.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, bgcolor: color }))}
                  className={clsx(
                    'w-6 h-6 rounded-full border',
                    formData.bgcolor === color ? 'ring-2 ring-main-blue' : '',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* <input
                type="color"
                name="bgcolor"
                value={formData.bgcolor}
                onChange={handleChange}
                className="w-6 h-6 p-0 border-0"
              /> */}
            </div>
          </div>
          {/* Text Color */}
          <div className="flex flex-col">
            <label className="text-sm pb-1 font-medium">Text Color</label>
            <div className="flex items-center gap-2 wrap">
              {presetText.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color: color }))}
                  className={clsx(
                    'w-6 h-6 rounded-full border',
                    formData.color === color ? 'ring-2 ring-main-blue' : '',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-6 h-6 p-0 border-0"
              /> */}
            </div>
          </div>
        </div>

        {/* Font Size */}
        <div className="flex flex-col">
          <label className="text-sm pb-1 font-medium">Font Size ({formData.fontSize}px)</label>
          <input
            type="range"
            name="fontSize"
            min="12"
            max="24"
            value={formData.fontSize}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end mb-6">
          <button
            type="submit"
            className="flex items-center justify-center w-32 p-2 border rounded bg-main-blue text-white transition duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <RotatingLines
                visible={true}
                strokeWidth="5"
                animationDuration="0.75"
                strokeColor="#ffffff"
                ariaLabel="rotating-lines-loading"
                width="24"
              />
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm">Create</p>
                <RiVideoAddLine className="text-xl" />
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
