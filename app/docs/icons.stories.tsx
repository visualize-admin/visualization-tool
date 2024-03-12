import { Table, TableCell, TableHead, TableRow } from "@mui/material";
import { Meta } from "@storybook/react";

import { Icon, Icons } from "../icons";

const meta: Meta = {
  component: Icon,
  title: "components / Icons",
};

export default meta;

const IconsStory = () => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Icon</TableCell>
          <TableCell>Icon (color)</TableCell>
          <TableCell>Icon (3rem)</TableCell>
          <TableCell>Icon (4rem)</TableCell>
        </TableRow>
      </TableHead>
      {(Object.keys(Icons) as (keyof typeof Icons)[]).map((k) => (
        <TableRow key={k}>
          <TableCell>{k}</TableCell>
          <TableCell>
            <Icon name={k} size={24} />
          </TableCell>
          <TableCell>
            <Icon name={k} size={24} color="#006699" />
          </TableCell>
          <TableCell>
            <Icon name={k} size={48} />
          </TableCell>
          <TableCell>
            <Icon name={k} size={64} />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export { IconsStory as Icons };
