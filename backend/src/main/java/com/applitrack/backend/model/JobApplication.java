package com.applitrack.backend.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    private String company;

    private String role;

    private String salary;

    private String status;

    @Column(length = 2000)
    private String notes;

    private String link;

    private LocalDate appliedDate;

    public JobApplication() {
    }

    public JobApplication(AppUser user, String company, String role, String salary,
            String status, String notes, String link, LocalDate appliedDate) {
        this.user = user;
        this.company = company;
        this.role = role;
        this.salary = salary;
        this.status = status;
        this.notes = notes;
        this.link = link;
        this.appliedDate = appliedDate;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AppUser getUser() {
        return this.user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getCompany() {
        return this.company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSalary() {
        return this.salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return this.notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getLink() {
        return this.link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public LocalDate getAppliedDate() {
        return this.appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }
}
