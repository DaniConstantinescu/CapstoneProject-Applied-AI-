'use client';

import React from 'react';
import { Tag } from '@carbon/react';
import { OrderStatus } from '../lib/types';

interface OrderStatusTagProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusTag({ status, size = 'md' }: OrderStatusTagProps) {
  let tagType: 'blue' | 'purple' | 'green' | 'cool-gray' = 'cool-gray';

  switch (status) {
    case 'Confirmed':
      tagType = 'blue';
      break;
    case 'Shipped':
      tagType = 'purple';
      break;
    case 'Delivered':
      tagType = 'green';
      break;
    case 'Cancelled':
      tagType = 'cool-gray';
      break;
  }

  return (
    <Tag size={size} type={tagType}>
      {status}
    </Tag>
  );
}
