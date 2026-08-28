'use client'

import ButtonComponent from '@/components/buttons/ButtonComponent'
import TextInput from '@/components/inputs/TextInput'
import React from 'react'

const LacakPage = () => {
  return (
    <div className='h-dvh flex items-center justify-center'>
      <div className='space-y-10 p-5'>
        <h1 className='text-5xl font-semibold'>Lacak Pencucian Anda</h1>
        <div className='space-y-4'>
          <TextInput id='order_id' label='Kode Pesanan' isRed={true} required onChange={() => { }} />
          <ButtonComponent
            label='Lacak Pesanan'
            className='w-full'
            onClick={() => { }}
            isPrimary={true} />
        </div>
      </div>
    </div>
  )
}

export default LacakPage