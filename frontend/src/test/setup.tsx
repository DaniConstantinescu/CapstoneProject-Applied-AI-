import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

vi.mock('@carbon/react', () => {
  return {
    Tag: ({ children, type, ...props }: any) => (
      <span data-testid="carbon-tag" className={`cds--tag ${type || ''}`} {...props}>
        {children}
      </span>
    ),
    Tile: ({ children, className, style, ...props }: any) => (
      <div data-testid="carbon-tile" className={`cds--tile ${className || ''}`} style={style} {...props}>
        {children}
      </div>
    ),
    Button: ({ children, kind, onClick, disabled, renderIcon: Icon, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Breadcrumb: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    BreadcrumbItem: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    InlineNotification: ({ title, subtitle, ...props }: any) => (
      <div role="alert" {...props}>
        <strong>{title}</strong> {subtitle}
      </div>
    ),
    InlineLoading: ({ description, ...props }: any) => <div {...props}>{description}</div>,
    Search: ({ labelText, value, onChange, ...props }: any) => (
      <input aria-label={labelText} value={value} onChange={onChange} {...props} />
    ),
    Select: ({ children, labelText, value, onChange, ...props }: any) => (
      <select aria-label={labelText} value={value} onChange={onChange} {...props}>
        {children}
      </select>
    ),
    SelectItem: ({ value, text }: any) => <option value={value}>{text}</option>,
    Form: ({ children, onSubmit, ...props }: any) => (
      <form onSubmit={onSubmit} {...props}>
        {children}
      </form>
    ),
    TextInput: ({ labelText, id, value, onChange, ...props }: any) => (
      <div>
        <label htmlFor={id}>{labelText}</label>
        <input id={id} value={value} onChange={onChange} {...props} />
      </div>
    ),
    PasswordInput: ({ labelText, id, value, onChange, ...props }: any) => (
      <div>
        <label htmlFor={id}>{labelText}</label>
        <input type="password" id={id} value={value} onChange={onChange} {...props} />
      </div>
    ),
    Header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    HeaderName: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    HeaderNavigation: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    HeaderMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    HeaderGlobalBar: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    HeaderGlobalAction: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
      <button aria-label={ariaLabel} onClick={onClick} {...props}>
        {children}
      </button>
    ),
    Theme: ({ children }: any) => <div>{children}</div>,
    Modal: ({ children, open, ...props }: any) => (open ? <div role="dialog" {...props}>{children}</div> : null),
    Tabs: ({ children }: any) => <div>{children}</div>,
    TabList: ({ children }: any) => <div role="tablist">{children}</div>,
    Tab: ({ children, ...props }: any) => <button role="tab" {...props}>{children}</button>,
    TabPanels: ({ children }: any) => <div>{children}</div>,
    TabPanel: ({ children }: any) => <div role="tabpanel">{children}</div>,
  };
});
