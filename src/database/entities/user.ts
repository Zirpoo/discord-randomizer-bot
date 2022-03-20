import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { List } from "./list";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @OneToMany(type => List, list => list.user)
    lists: List[];
}
