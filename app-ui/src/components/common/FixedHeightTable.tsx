import React from 'react';
import { Table, TableProps, TablePaginationConfig } from 'antd';

interface FixedHeightTableProps<T> extends TableProps<T> {
  /**
   * Chiều cao cố định của container chứa table
   * @default 'calc(100vh - 240px)'
   */
  containerHeight?: string | number;
  
  /**
   * Chiều cao tối đa cho phần scroll của table
   * @default 'calc(100vh - 370px)'
   */
  scrollY?: string | number;
  
  /**
   * Chiều rộng tối thiểu của table
   * @default 800
   */
  scrollX?: number;
  
  /**
   * Class name thêm vào container
   */
  containerClassName?: string;
}

/**
 * Component Table có chiều cao cố định, phần phân trang luôn nằm ở vị trí cố định
 * bất kể số lượng dòng hiển thị là bao nhiêu
 */
function FixedHeightTable<T extends object = any>({
  containerHeight = 'calc(100vh - 240px)',
  scrollY = 'calc(100vh - 350px)',
  scrollX = 800,
  containerClassName = '',
  pagination,
  scroll,
  style,
  className,
  ...restProps
}: FixedHeightTableProps<T>) {
  // Merge scroll options
  const mergedScroll = {
    x: scrollX,
    y: scrollY,
    ...scroll
  };
  
  // Default pagination position to bottom center if pagination is provided
  const mergedPagination = pagination === false ? false : {
    position: ['bottomCenter'] as ('topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight')[],
    size: 'small',
    ...pagination
  } as TablePaginationConfig;
  
  return (
    <div 
      className={`fixed-height-table-container ${containerClassName}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: containerHeight, 
        overflow: 'hidden'
      }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <Table<T>
          size="small"
          scroll={mergedScroll}
          pagination={mergedPagination}
          style={{ 
            backgroundColor: '#fff',
            height: '100%',
            ...style
          }}
          className={`fixed-height-table ${className || ''}`}
          {...restProps}
        />
      </div>
      
      <style jsx global>{`
        /* Đảm bảo phần body của table luôn chiếm hết không gian có sẵn */
        .fixed-height-table-container .ant-spin-nested-loading {
          height: 100%;
        }
        .fixed-height-table-container .ant-spin-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .fixed-height-table-container .ant-table {
          flex: 1;
        }
        .fixed-height-table-container .ant-table-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        /* Chỉ cho phép scroll ở table body */
        .fixed-height-table-container .ant-table-body {
          flex: 1;
          overflow: auto !important;
        }
   
       
      `}</style>
    </div>
  );
}

export default FixedHeightTable;
